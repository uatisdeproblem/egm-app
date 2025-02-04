///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { MealTicket, MealType } from '../models/meals.model';
import { User } from '../models/user.model';
import { Configurations } from '../models/configurations.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const STAGE = process.env.STAGE;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  configurations: process.env.DDB_TABLE_configurations,
  mealTickets: process.env.DDB_TABLE_mealTickets
};
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new MealTicketsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class MealTicketsRC extends ResourceController {
  configurations: Configurations;
  reqUser: User;
  targetUser: User;
  mealTicket: MealTicket;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'userId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.configurations = new Configurations(
        await ddb.get({ TableName: DDB_TABLES.configurations, Key: { PK: Configurations.PK } })
      );
    } catch (err) {
      throw new HandledError('Configuration not found');
    }

    try {
      this.reqUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (
      this.principalId !== this.resourceId &&
      !this.reqUser.canScanMealsTicket()
    )
      throw new HandledError('Unauthorized');

    if (!this.resourceId) return;

    if (this.principalId === this.resourceId) {
        this.targetUser = this.reqUser;
    } else {

      try {
        this.targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.resourceId } }));
      } catch (error) {
        throw new HandledError('Target user not found');
      }
    }

  }

  protected async patchResource(): Promise<void> {
    console.log("BODY: ", this.body);
    switch (this.body.action) {
      case 'SCAN_TICKET':
        return await this.scanTicket();

      case 'GENERATE_TICKET':
        return await this.generateTicket();

      default:
        throw new HandledError('Unsupported action');
    }
  }

  private async scanTicket() {
    if (!this.reqUser.canScanMealsTicket())
      throw new HandledError('Unauthorized');

    this.targetUser.mealTickets[0].status = true;
    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      UpdateExpression: 'SET mealTickets = :tickets',
      ExpressionAttributeValues: { ':tickets': this.targetUser.mealTickets }
    });

  }

  private async generateTicket() {
    if (!this.reqUser.canManageMeals() && this.principalId !== this.resourceId)
      throw new HandledError('Unauthorized');

    this.targetUser.mealTickets.push(new MealTicket());
    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: this.targetUser.userId },
      UpdateExpression: 'SET mealTickets = :tickets',
      ExpressionAttributeValues: { ':tickets': this.targetUser.mealTickets }
    });
  }

  protected async getResource(): Promise<MealTicket[]> {
    return this.targetUser.mealTickets;
  }
}
