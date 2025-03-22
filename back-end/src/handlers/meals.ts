///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { ApprovedType, Meal } from '../models/meal.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  meals: process.env.DDB_TABLE_meals
};
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new MealsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class MealsRC extends ResourceController {
  user: User;
  meal: Meal;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'mealId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.meal = new Meal(await ddb.get({ TableName: DDB_TABLES.meals, Key: { mealId: this.resourceId } }));
    } catch (err) {
      throw new HandledError('Meal not found');
    }
  }

  protected async getResource(): Promise<Meal> {
    return this.meal;
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'SCAN_TICKET':
        return await this.scanTicket(this.body.userId, this.body.approvedType);
      default:
        throw new HandledError('Unsupported action');
    }
  }

  private async scanTicket(userId: string, approvedType: ApprovedType): Promise<void> {
    if (!this.user.permissions.isStaff) throw new HandledError('Unauthorized');

    const now = new Date();
    if (!this.meal.isMealValid(now)) throw new HandledError('Ticket not available');

    const targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId } }));

    if (!targetUser.mealTickets) targetUser.mealTickets = {};
    if (targetUser.mealTickets?.[this.meal.mealId]?.approvedAt) throw new HandledError('Ticket already used');

    targetUser.mealTickets[this.meal.mealId] = {
      approvedAt: now.toISOString(),
      approvedBy: this.user.getName(),
      approvedType
    };

    await ddb.update({
      TableName: DDB_TABLES.users,
      Key: { userId: targetUser.userId },
      UpdateExpression: 'SET mealTickets = :mealTickets',
      ExpressionAttributeValues: { ':mealTickets': targetUser.mealTickets }
    });
  }

  protected async getResources(): Promise<Meal[]> {
    return (await ddb.scan({ TableName: DDB_TABLES.meals })).map(x => new Meal(x));
  }

  protected async putResource(): Promise<Meal> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Meal(this.meal);
    this.meal.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }

  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Meal> {
    const errors = this.meal.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.meals, Item: this.meal };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(mealId)';
      await ddb.put(putParams);

      return this.meal;
    } catch (err) {
      throw new HandledError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.meals, Key: { mealId: this.resourceId } });
    } catch (err) {
      throw new HandledError('Delete failed');
    }
  }

  protected async postResources(): Promise<Meal> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.meal = new Meal(this.body);
    this.meal.mealId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }
}
