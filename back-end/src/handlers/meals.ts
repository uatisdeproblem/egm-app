///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { ApprovedType, MealTicket } from '../models/meals.model';
import { User } from '../models/user.model';
import { Configurations } from '../models/configurations.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const STAGE = process.env.STAGE;

const DDB_TABLES = {
  users: process.env.DDB_TABLE_users,
  configurations: process.env.DDB_TABLE_configurations,
  mealTickets: process.env.DDB_TABLE_meals
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
    super(event, callback, { resourceId: 'mealTicketId' });
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
      this.principalId !== this.pathParameters.userId &&
      !this.reqUser.canScanMealsTicket()
    )
      throw new HandledError('Unauthorized');

    if (!this.pathParameters.userId) return;

    if (this.principalId === this.pathParameters.userId) {
        this.targetUser = this.reqUser;
    } else {

      try {
        this.targetUser = new User(await ddb.get({ TableName: DDB_TABLES.users,
                                                   Key: { userId: this.pathParameters.userId } }));
      } catch (error) {
        throw new HandledError('Target user not found');
      }
    }

  }

  protected async getResource(): Promise<MealTicket[]> {
    return (await ddb.query({
      TableName: DDB_TABLES.mealTickets,
      KeyConditionExpression: 'mealTicketId = :mealTicketId',
      ExpressionAttributeValues: { ':mealTicketId': this.resourceId }
    })).map(x => new MealTicket(x));
  }

  protected async patchResource(): Promise<void> {
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

    const ticketConfig = this.configurations.mealConfigurations.mealInfo.find(ticket =>
                                                                              ticket.ticketId == this.resourceId)

    if (!ticketConfig) throw new HandledError('Ticket not found');

    const now = new Date().toISOString();
    if (now < ticketConfig.startValidity || now > ticketConfig.endValidity)
      throw new HandledError('Ticket not available');

    const mealTicket: MealTicket = await ddb.get({
      TableName: DDB_TABLES.mealTickets,
      Key: { userId: this.pathParameters.userId, mealTicketId: this.resourceId}
    })

    if (mealTicket.status)
      throw new HandledError('Ticket already validated');

    await ddb.update({
      TableName: DDB_TABLES.mealTickets,
      Key: { userId: this.pathParameters.userId, mealTicketId: this.resourceId},
      UpdateExpression: 'SET #s=:status, approvedAt=:approvedAt, approvedBy=:approvedBy,approvedType=:type',
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ':status': true, ':approvedAt': new Date().toISOString(),
                                   ':approvedBy': this.reqUser.userId,
                                   ':type': this.body.approveType ?? ApprovedType.QR_SCAN
       }
    });

  }

  private async generateTicket() {
    if (!this.reqUser.canManageMeals() && this.principalId !== this.pathParameters.userId)
      throw new HandledError('Unauthorized');

    const ticketConfig = this.configurations.mealConfigurations.mealInfo.find(ticket =>
                                                                              ticket.ticketId == this.resourceId)

    const now = new Date().toISOString()
    if (now < ticketConfig.startValidity || now > ticketConfig.endValidity)
      throw new HandledError('Ticket not available');

    const mealTicket: MealTicket = new MealTicket({
      mealTicketId: this.resourceId,
      name: ticketConfig.name,
      userId: this.targetUser.userId,
      userName: this.targetUser.firstName + ' ' + this.targetUser.lastName,
      userCountry: this.targetUser.sectionCountry,
      type: this.targetUser.mealType,
      status: false
    });

    await ddb.put({
      TableName: DDB_TABLES.mealTickets, Item: mealTicket
    });
  }

  protected async getResources(): Promise<MealTicket[]> {
    if (this.principalId != this.pathParameters.userId && !this.reqUser.canManageMeals())
      throw new HandledError('Unauthorized');

    return (
      await ddb.query({
        TableName: DDB_TABLES.mealTickets,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': this.pathParameters.userId }
      })
    ).map((x) => new MealTicket(x));
  }
}
