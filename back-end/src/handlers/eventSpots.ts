///
/// IMPORTS
///

import { addWeeks } from 'date-fns';

import { DynamoDB, RCError, ResourceController } from 'idea-aws';
import { toISODate } from 'idea-toolbox';

import { sendEmail } from '../utils/notifications.utils';

import { EventSpot, EventSpotAttached } from '../models/eventSpot.model';
import { User } from '../models/user.model';
import { Configurations, EmailTemplates } from '../models/configurations.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const STAGE = process.env.STAGE;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  configurations: process.env.DDB_TABLE_configurations,
  eventSpots: process.env.DDB_TABLE_eventSpots
};
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new EventSpotsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class EventSpotsRC extends ResourceController {
  configurations: Configurations;
  user: User;
  spot: EventSpot;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'spotId' });
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
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new RCError('User not found');
    }

    if (!this.user.permissions.isAdmin && !this.user.permissions.isCountryLeader) throw new RCError('Unauthorized');

    if (!this.resourceId) return;

    try {
      this.spot = new EventSpot(await ddb.get({ TableName: DDB_TABLES.eventSpots, Key: { spotId: this.resourceId } }));
    } catch (err) {
      throw new RCError('Spot not found');
    }

    if (!this.user.permissions.isAdmin && this.spot.sectionCountry !== this.user.sectionCountry)
      throw new RCError('Unauthorized');
  }

  protected async getResource(): Promise<EventSpot> {
    return this.spot;
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'ASSIGN_TO_USER':
        return await this.assignToUser(this.body.userId);
      case 'TRANSFER_TO_USER':
        return await this.transferToUser(this.body.userId);
      case 'CONFIRM_PAYMENT':
        return await this.confirmPayment();
      case 'ASSIGN_TO_COUNTRY':
        return await this.assignToCountry(this.body.sectionCountry);
      case 'RELEASE':
        return await this.release();
      case 'EDIT_DESCRIPTION':
        return await this.editDescription(this.body.description);
      default:
        throw new RCError('Unsupported action');
    }
  }
  private async assignToUser(userId: string): Promise<void> {
    if (!this.user.permissions.isAdmin && !this.configurations.canCountryLeadersAssignSpots)
      throw new RCError('Unauthorized');

    let user: User;
    try {
      user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));
    } catch (error) {
      throw new RCError("User doesn't exist");
    }

    if (user.spot) throw new RCError('User already has spot');

    const updateSpot = {
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.spot.spotId },
      UpdateExpression: 'SET userId = :userId, userName = :userName',
      ExpressionAttributeValues: { ':userId': user.userId, ':userName': user.getName() }
    };

    const updateUser = {
      TableName: DDB_TABLES.users,
      Key: { userId: user.userId },
      UpdateExpression: 'SET spot = :spot',
      ExpressionAttributeValues: { ':spot': new EventSpotAttached(this.spot) }
    };

    await ddb.transactWrites([{ Update: updateSpot }, { Update: updateUser }]);

    const toAddresses = [user.email];
    const template = `${EmailTemplates.SPOT_ASSIGNED}-${STAGE}`;
    const aWeekFromNow = addWeeks(new Date(), 1);
    const templateData = {
      name: user.getName(),
      spotType: this.spot.type,
      reference: this.spot.spotId,
      deadline: toISODate(aWeekFromNow)
    };

    try {
      await sendEmail(toAddresses, template, templateData);
    } catch (error) {
      this.logger.warn('Error sending email', error, { template });
    }
  }
  private async transferToUser(targetUserId: string): Promise<void> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    let sourceUser: User;
    try {
      sourceUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.spot.userId } }));
    } catch (error) {
      throw new RCError("Source user doesn't exist");
    }

    let targetUser: User;
    try {
      targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: targetUserId } }));
    } catch (error) {
      throw new RCError("Target user doesn't exist");
    }

    if (targetUser.spot) throw new RCError('Target user already has spot');

    const updateSpot = {
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.spot.spotId },
      UpdateExpression: 'SET userId = :userId, userName = :userName',
      ExpressionAttributeValues: { ':userId': targetUser.userId, ':userName': targetUser.getName() }
    };

    const updateTargetUser = {
      TableName: DDB_TABLES.users,
      Key: { userId: targetUser.userId },
      UpdateExpression: 'SET spot = :spot',
      ExpressionAttributeValues: { ':spot': new EventSpotAttached(this.spot) }
    };

    const updateSourceUser = {
      TableName: DDB_TABLES.users,
      Key: { userId: sourceUser.userId },
      UpdateExpression: 'REMOVE spot'
    };

    await ddb.transactWrites([{ Update: updateSpot }, { Update: updateTargetUser }, { Update: updateSourceUser }]);

    try {
      const toAddresses = [sourceUser.email];
      const template = `${EmailTemplates.SPOT_TRANSFERRED}-${STAGE}`;
      const templateData = {
        name: sourceUser.getName(),
        reference: this.spot.spotId
      };

      await sendEmail(toAddresses, template, templateData);
    } catch (error) {
      this.logger.warn('Error sending email', error, { temlate: EmailTemplates.SPOT_TRANSFERRED });
    }

    try {
      const toAddresses = [targetUser.email];
      const template = `${EmailTemplates.SPOT_ASSIGNED}-${STAGE}`;
      const aWeekFromNow = addWeeks(new Date(), 1);
      const templateData = {
        name: targetUser.getName(),
        spotType: this.spot.type,
        reference: this.spot.spotId,
        deadline: toISODate(aWeekFromNow)
      };

      await sendEmail(toAddresses, template, templateData);
    } catch (error) {
      this.logger.warn('Error sending email', error, { temlate: EmailTemplates.SPOT_TRANSFERRED });
    }
  }
  private async confirmPayment(): Promise<void> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    if (this.spot.paymentConfirmedAt) return;

    this.spot.paymentConfirmedAt = new Date().toISOString();

    const updateSpot = {
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.spot.spotId },
      // @todo should we also set some value in `proofOfPaymentURI`, in case it isn't set?
      UpdateExpression: 'SET paymentConfirmedAt = :paymentConfirmedAt',
      ExpressionAttributeValues: { ':paymentConfirmedAt': this.spot.paymentConfirmedAt }
    };

    const writes: any = [{ Update: updateSpot }];

    let user: User;
    if (this.spot.userId) {
      try {
        user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.spot.userId } }));
      } catch (error) {
        throw new RCError("User doesn't exist");
      }

      const updateUser = {
        TableName: DDB_TABLES.users,
        Key: { userId: user.userId },
        UpdateExpression: 'SET spot = :spot',
        ConditionExpression: 'spot.spotId = :spotId',
        ExpressionAttributeValues: { ':spot': new EventSpotAttached(this.spot), ':spotId': this.spot.spotId }
      };
      writes.push({ Update: updateUser });
    }

    await ddb.transactWrites(writes);

    if (user) {
      const toAddresses = [user.email];
      const template = `${EmailTemplates.REGISTRATION_CONFIRMED}-${STAGE}`;
      const templateData = {
        name: user.getName()
      };

      try {
        await sendEmail(toAddresses, template, templateData);
      } catch (error) {
        this.logger.warn('Error sending email', error, { template });
      }
    }
  }
  private async assignToCountry(sectionCountry: string): Promise<void> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    await ddb.update({
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.spot.spotId },
      UpdateExpression: 'SET sectionCountry = :sectionCountry',
      ExpressionAttributeValues: { ':sectionCountry': sectionCountry }
    });
  }
  private async release(): Promise<void> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    if (!this.spot.userId && !this.spot.sectionCountry) return;

    const updateSpot = {
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.spot.spotId },
      UpdateExpression: 'REMOVE userId, userName'
    };

    const writes: any[] = [{ Update: updateSpot }];

    let user: User;
    if (this.spot.userId) {
      try {
        user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.spot.userId } }));
      } catch (error) {
        throw new RCError("User doesn't exist");
      }

      const updateUser = {
        TableName: DDB_TABLES.users,
        Key: { userId: user.userId },
        UpdateExpression: 'REMOVE spot'
      };
      writes.push({ Update: updateUser });
    }

    await ddb.transactWrites(writes);

    if (user) {
      const toAddresses = [user.email];
      const template = `${EmailTemplates.SPOT_RELEASED}-${STAGE}`;
      const templateData = {
        name: user.getName(),
        reference: this.spot.spotId
      };

      try {
        await sendEmail(toAddresses, template, templateData);
      } catch (error) {
        this.logger.warn('Error sending email', error, { template });
      }
    }
  }
  private async editDescription(description: string): Promise<void> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    await ddb.update({
      TableName: DDB_TABLES.eventSpots,
      Key: { spotId: this.spot.spotId },
      UpdateExpression: 'SET description = :description',
      ExpressionAttributeValues: { ':description': description }
    });
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    if (this.spot.userId) throw new RCError('Release the spot first');

    await ddb.delete({ TableName: DDB_TABLES.eventSpots, Key: { spotId: this.spot.spotId } });
  }

  protected async getResources(): Promise<EventSpot[]> {
    let spots = (await ddb.scan({ TableName: DDB_TABLES.eventSpots })).map(x => new EventSpot(x));
    if (!this.user.permissions.canManageRegistrations)
      spots = spots.filter(x => x.sectionCountry === this.user.sectionCountry);
    return spots;
  }

  protected async postResources(): Promise<EventSpot[]> {
    if (!this.user.permissions.isAdmin) throw new RCError('Unauthorized');

    const numOfSpots = Number(this.body.numOfSpots ?? 1);
    this.spot = new EventSpot({
      type: this.body.type,
      description: this.body.description,
      sectionCountry: this.body.sectionCountry
    });

    const errors = this.spot.validate();
    if (numOfSpots < 1) errors.push('numOfSpots');
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    const batchId = Math.round(Date.now() / 1000).toString();
    const spotsToAdd: EventSpot[] = [];
    for (let i = 0; i < numOfSpots; i++) {
      const spotToAdd = new EventSpot(this.spot);
      spotToAdd.spotId = batchId.concat('_', '0000'.concat((i + 1).toString()).slice(-4));
      spotsToAdd.push(spotToAdd);
    }
    await ddb.batchPut(DDB_TABLES.eventSpots, spotsToAdd);
    return spotsToAdd;
  }
}
