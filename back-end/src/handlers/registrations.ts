///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';
import { User } from '../models/user.model';
import { Registration, RegistrationStatus } from '../models/registration.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  registrations: process.env.DDB_TABLE_registrations
};
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new RegistrationsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class RegistrationsRC extends ResourceController {
  requestingUserId: string;
  profile: User;
  registration: Registration;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'registrationId' });
    this.requestingUserId = this.cognitoUser?.userId
      ? this.cognitoUser?.userId
      : event.requestContext.authorizer.lambda.principalId;
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.profile = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.requestingUserId } }));
    } catch (err) {
      throw new RCError('Profile not found');
    }

    if (!this.resourceId) return;

    try {
      this.registration = new Registration(
        await ddb.get({ TableName: DDB_TABLES.registrations, Key: { registrationId: this.resourceId } })
      );
    } catch (error) {
      if (String(error) === 'Error: Not found') await this.initRegistration();
      else throw new RCError('Registration not found');
    }

    if (this.profile.userId !== this.resourceId && !this.profile.isAdmin()) throw new RCError('Unauthorized');
  }

  private async initRegistration() {
    this.registration = new Registration({
      registrationId: this.resourceId,
      name: this.profile.lastName || '',
      email: this.profile.email || '',
      sectionCode: this.profile.sectionCode,
      section: this.profile.sectionName,
      country: this.profile.sectionCountry
    });
    await ddb.put({ TableName: DDB_TABLES.registrations, Item: this.registration });
  }

  protected async getResource(): Promise<Registration> {
    return this.registration;
  }

  protected async putResource(): Promise<Registration> {
    if (this.registration.submitted) throw new RCError('Registration is already submitted!'); // @todo check this

    const oldRegistration = new Registration(this.registration);
    this.registration.safeLoad(this.body, oldRegistration);

    return await this.putSafeResource({ noOverwrite: false });
  }

  private async putSafeResource(opts: { noOverwrite: boolean }): Promise<Registration> {
    const putParams: any = { TableName: DDB_TABLES.registrations, Item: this.registration };
    if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(registrationId)';
    await ddb.put(putParams);

    return this.registration;
  }

  protected async patchResource(): Promise<any> {
    switch (this.body.action) {
      case 'APPROVE':
        if (!this.profile.isAdmin()) throw new RCError('Unauthorized');
        return await this.setRegistrationStatus(RegistrationStatus.APPROVED);
      case 'SUBMIT':
        return this.submitRegistration();
      case 'CANCEL':
        // @todo see how this affects the rest
        // @todo both the user and admin can do this
        return await this.setRegistrationStatus(RegistrationStatus.CANCELLED);
      default:
        throw new RCError('Unsupported action');
    }
  }

  private async submitRegistration(): Promise<Registration> {
    const errors = this.registration.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    this.registration.submitted = true;
    return await this.setRegistrationStatus(RegistrationStatus.AWAITING_APPROVAL);
  }

  private async setRegistrationStatus(status: RegistrationStatus): Promise<Registration> {
    if (!this.registration.submitted) throw new RCError('Registration not submitted yet!');
    // @todo does this error make sense??
    if (this.registration.status !== RegistrationStatus.AWAITING_APPROVAL)
      throw new RCError('Registration is not awaiting approval');

    try {
      await ddb.update({
        TableName: DDB_TABLES.registrations,
        Key: { userId: this.registration.registrationId },
        UpdateExpression: `SET status = :status`,
        ExpressionAttributeValues: { ':status': status }
      });
      return this.registration;
    } catch (err) {
      throw new RCError('Error updating registration');
    }
  }

  protected async getResources(): Promise<Registration[]> {
    if (!this.profile.isAdmin()) throw new RCError('Unauthorized'); // @todo verify permission

    try {
      return (
        await ddb.scan({
          TableName: DDB_TABLES.registrations,
          ExpressionAttributeValues: { ':true': true },
          FilterExpression: 'submitted = :true'
        })
      ).map(x => new Registration(x));
    } catch (error) {
      throw new RCError("Couldn't load registrations");
    }
  }
}
