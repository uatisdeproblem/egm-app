///
/// IMPORTS
///

import { addDays } from 'date-fns';
import { SignedURL, toISODate } from 'idea-toolbox';
import { Cognito, DynamoDB, GetObjectTypes, RCError, ResourceController, S3 } from 'idea-aws';
import { HTML2PDF } from 'idea-html2pdf';

import { AuthServices, User, UserPermissions } from '../models/user.model';
import { Configurations } from '../models/configurations.model';
import { EventSpot, EventSpotAttached } from '../models/eventSpot.model';
import { sendSimpleEmail } from '../utils/notifications.utils';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;
const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  configurations: process.env.DDB_TABLE_configurations,
  eventSpots: process.env.DDB_TABLE_eventSpots
};
const ddb = new DynamoDB();

const S3_BUCKET_MEDIA = process.env.S3_BUCKET_MEDIA;
const S3_IMAGES_FOLDER = process.env.S3_IMAGES_FOLDER;
const S3_ATTACHMENTS_FOLDER = process.env.S3_ATTACHMENTS_FOLDER;
const S3_ASSETS_FOLDER = process.env.S3_ASSETS_FOLDER;
const S3_DOWNLOADS_FOLDER = process.env.S3_DOWNLOADS_FOLDER;
const s3 = new S3();

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const cognito = new Cognito();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new UsersRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class UsersRC extends ResourceController {
  configurations: Configurations;
  reqUser: User;
  targetUser: User;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.configurations = new Configurations(
        await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configurations.PK } })
      );
    } catch (err) {
      throw new RCError('Configuration not found');
    }

    try {
      this.reqUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('Requesting user not found');
    }

    if (this.resourceId === 'me') this.resourceId = this.principalId;

    if (!this.resourceId) return;

    if (this.principalId === this.resourceId) {
      this.targetUser = this.reqUser;
      return;
    }

    try {
      this.targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.resourceId } }));
    } catch (error) {
      throw new RCError('Target user not found');
    }

    const isCountryLeaderThatWantToReadCountryUser =
      this.reqUser.permissions.isCountryLeader &&
      this.reqUser.sectionCountry === this.targetUser.sectionCountry &&
      this.httpMethod === 'GET';
    if (
      this.principalId !== this.resourceId &&
      !this.reqUser.permissions.canManageRegistrations &&
      !isCountryLeaderThatWantToReadCountryUser
    )
      throw new RCError('Unauthorized');
  }

  protected async getResource(): Promise<User> {
    (this.targetUser as any).configurations = this.configurations;
    return this.targetUser;
  }

  protected async putResource(): Promise<User> {
    const oldUser = new User(this.targetUser);
    this.targetUser.safeLoad(this.body, oldUser);

    return await this.putSafeResource();
  }
  private async putSafeResource(): Promise<User> {
    const errors = this.targetUser.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    await ddb.put({ TableName: DDB_TABLES.users, Item: this.targetUser });
    return this.targetUser;
  }

  protected async patchResource(): Promise<User | SignedURL> {
    switch (this.body.action) {
      case 'GET_AVATAR_UPLOAD_URL':
        return await this.getSignedURLToUploadAvatar();
      case 'REGISTER_TO_EVENT':
        return await this.registerToEvent(this.body.registrationForm, this.body.isDraft);
      case 'CHANGE_PERMISSIONS':
        return await this.changeUserPermissions(this.body.permissions);
      case 'GET_INVOICE':
        return await this.generateUserInvoice();
      case 'GET_PROOF_OF_PAYMENT':
        return await this.getSignedURLToDownloadProofOfPayment();
      case 'PUT_PROOF_OF_PAYMENT_START':
        return await this.getSignedURLToUploadProofOfPayment();
      case 'PUT_PROOF_OF_PAYMENT_END':
        return await this.confirmUploadProofOfPayment(this.body.fileURI);
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async getSignedURLToUploadAvatar(): Promise<SignedURL> {
    if (this.reqUser !== this.targetUser) throw new RCError('Unauthorized');

    const imageURI = await ddb.IUNID(PROJECT.concat('-avatar'));
    const key = `${S3_IMAGES_FOLDER}/${imageURI}.png`;
    const signedURL = await s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = imageURI;
    return signedURL;
  }
  private async registerToEvent(registrationForm: any, isDraft: boolean): Promise<User> {
    if (!this.configurations.canUserRegister(this.targetUser) && !this.reqUser.permissions.canManageRegistrations)
      throw new RCError('Registrations are closed');
    if (this.targetUser.registrationAt && !this.reqUser.permissions.canManageRegistrations)
      throw new RCError("Can't edit a submitted registration");

    this.targetUser.registrationForm = this.configurations.registrationFormDef.loadSections(registrationForm);

    if (isDraft) this.targetUser.registrationAt = null;
    else {
      const errors = this.configurations.registrationFormDef.validateSections(this.targetUser.registrationForm);
      if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);
      this.targetUser.registrationAt = new Date().toISOString();
    }

    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      UpdateExpression: 'SET registrationForm = :form, registrationAt = :at',
      ExpressionAttributeValues: { ':form': this.targetUser.registrationForm, ':at': this.targetUser.registrationAt }
    });

    return this.targetUser;
  }
  private async changeUserPermissions(permissions: UserPermissions): Promise<User> {
    if (!this.reqUser.permissions.isAdmin) throw new RCError('Unauthorized');

    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      ExpressionAttributeNames: { '#permissions': 'permissions' },
      UpdateExpression: 'SET #permissions = :permissions',
      ExpressionAttributeValues: { ':permissions': permissions }
    });

    return this.targetUser;
  }

  private async generateUserInvoice(): Promise<SignedURL> {
    if (!this.reqUser.registrationAt || !this.reqUser.spot) return;

    const filename = `${this.reqUser.spot.spotId}_invoice.pdf`;

    const bucket = S3_BUCKET_MEDIA;
    const key = S3_DOWNLOADS_FOLDER + `/invoices/${filename}`;

    const objectExists = await s3.doesObjectExist({
      bucket,
      key
    });
    if (objectExists) return await s3.signedURLGet(S3_BUCKET_MEDIA, key);

    const htmlBody = (await s3.getObject({
      bucket: S3_BUCKET_MEDIA,
      key: S3_ASSETS_FOLDER.concat('/payment-invoice.hbs'),
      type: GetObjectTypes.TEXT
    })) as string;

    const pdfVariables = {
      reference: this.reqUser.spot.spotId,
      issueDate: toISODate(new Date()),
      dueDate: toISODate(addDays(new Date(), 7)),
      invoiceAddress: this.reqUser.registrationForm.financial.invoiceAddress,
      name: `${this.reqUser.firstName} ${this.reqUser.lastName}`,
      spotType: this.reqUser.spot.type,
      spotPrice: `${this.configurations.pricePerSpotTypes[this.reqUser.spot.type]}.00€`
    };

    try {
      const html2pdf = new HTML2PDF();

      const body = await html2pdf.create({
        body: html2pdf.handlebarsCompile(htmlBody, { compat: true })(pdfVariables),
        pdfOptions: { margin: { top: '0cm', right: '0cm', bottom: '0cm', left: '0cm' } }
      });

      s3.putObject({
        bucket,
        key,
        body,
        contentType: 'application/pdf',
        filename
      });

      return await s3.signedURLGet(S3_BUCKET_MEDIA, key);
    } catch (err) {
      this.logger.warn('PDF creation failed', err);
      throw new RCError('PDF creation failed');
    }
  }

  private async getSignedURLToDownloadProofOfPayment(): Promise<SignedURL> {
    if (!this.targetUser.spot?.proofOfPaymentURI) throw new RCError('No proof of payment');

    const key = `${S3_ATTACHMENTS_FOLDER}/${this.targetUser.userId}_${this.targetUser.spot.proofOfPaymentURI}`;
    return await s3.signedURLGet(S3_BUCKET_MEDIA, key);
  }
  private async getSignedURLToUploadProofOfPayment(): Promise<SignedURL> {
    if (this.reqUser !== this.targetUser) throw new RCError('Unauthorized');
    if (!this.targetUser.spot) throw new RCError('No spot');
    if (this.targetUser.spot.paymentConfirmedAt) throw new RCError('Payment already confirmed');

    const fileURI = await ddb.IUNID(PROJECT.concat('-pop'));
    const key = `${S3_ATTACHMENTS_FOLDER}/${this.targetUser.userId}_${fileURI}`;
    const signedURL = await s3.signedURLPut(S3_BUCKET_MEDIA, key);
    signedURL.id = fileURI;
    return signedURL;
  }
  private async confirmUploadProofOfPayment(fileURI: string): Promise<User> {
    if (!this.targetUser.spot) throw new RCError('No spot');

    let spot: EventSpot;
    try {
      spot = new EventSpot(
        await ddb.get({ TableName: DDB_TABLES.eventSpots, Key: { spotId: this.targetUser.spot.spotId } })
      );
    } catch (error) {
      throw new RCError("Spot doesn't exist");
    }

    if (spot.userId !== this.targetUser.userId) throw new RCError('Wrong spot');

    spot.proofOfPaymentURI = fileURI;

    const updateSpot = {
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: spot.spotId },
      UpdateExpression: 'SET proofOfPaymentURI = :fileURI',
      ExpressionAttributeValues: { ':fileURI': fileURI }
    };

    this.targetUser.spot = new EventSpotAttached(spot);

    const updateUser = {
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      UpdateExpression: 'SET spot = :spot',
      ExpressionAttributeValues: { ':spot': this.targetUser.spot }
    };

    await ddb.transactWrites([{ Update: updateSpot }, { Update: updateUser }]);

    return this.targetUser;
  }

  protected async deleteResource(): Promise<void> {
    if (!this.reqUser.permissions.isAdmin && this.reqUser.userId !== this.targetUser.userId)
      throw new RCError('Unauthorized');

    if (this.targetUser.authService === AuthServices.COGNITO) {
      const cognitoUserId = this.targetUser.getAuthServiceUserId();
      const { email: cognitoUserEmail } = await cognito.getUserBySub(cognitoUserId, COGNITO_USER_POOL_ID);
      await cognito.deleteUser(cognitoUserEmail, COGNITO_USER_POOL_ID);
    }
    await ddb.delete({ TableName: DDB_TABLES.users, Key: { userId: this.targetUser.userId } });

    try {
      await this.releaseSpot();
    } catch (error) {
      this.logger.error('Failed to send delete warn email', error);
    }
  }

  protected async getResources(): Promise<User[]> {
    if (!(this.reqUser.permissions.canManageRegistrations || this.reqUser.permissions.isCountryLeader))
      throw new RCError('Unauthorized');

    // @todo we may want to add an index here to limit the fields in lists
    let users = (await ddb.scan({ TableName: DDB_TABLES.users })).map(x => new User(x));
    if (!this.reqUser.permissions.canManageRegistrations)
      users = users.filter(x => x.sectionCountry === this.reqUser.sectionCountry);

    return users;
  }

  private async releaseSpot(): Promise<void> {
    if (!this.targetUser.spot) return;

    const updateSpot = {
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.targetUser.spot.spotId },
      UpdateExpression: 'REMOVE userId, userName'
    };

    const writes: any[] = [{ Update: updateSpot }];

    await ddb.transactWrites(writes);

    const toAddresses = ['egm-technical@esn.org'];
    const subject = '[EGM] User with spot deleted';
    const content = `A user with ID ${this.targetUser.userId} has deleted his account and released the spot ${this.targetUser.spot.spotId}`;

    try {
      await sendSimpleEmail(toAddresses, subject, content);
    } catch (error) {
      this.logger.warn('Error sending email', error);
    }
  }
}
