///
/// IMPORTS
///

import { DynamoDB, RCError, ResourceController } from 'idea-aws';

import { Organization } from '../models/organization';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;

const DDB_TABLES = { organizations: process.env.DDB_TABLE_organizations };

const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any) => new Organizations(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Organizations extends ResourceController {
  organization: Organization;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'organizationId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.resourceId) return;

    try {
      this.organization = new Organization(
        await ddb.get({ TableName: DDB_TABLES.organizations, Key: { organizationId: this.resourceId } })
      );
    } catch (err) {
      throw new RCError('Organization not found');
    }
  }

  protected async getResource(): Promise<Organization> {
    return this.organization;
  }

  protected async putResource(): Promise<Organization> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    const oldResource = new Organization(this.organization);
    this.organization.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Organization> {
    const errors = this.organization.validate();
    if (errors.length) throw new RCError(`Invalid fields: ${errors.join(', ')}`);

    try {
      const putParams: any = { TableName: DDB_TABLES.organizations, Item: this.organization };
      if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(organizationId)';
      await ddb.put(putParams);

      return this.organization;
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }

  protected async deleteResource(): Promise<void> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    try {
      await ddb.delete({ TableName: DDB_TABLES.organizations, Key: { organizationId: this.resourceId } });
    } catch (err) {
      throw new RCError('Delete failed');
    }
  }

  protected async postResources(): Promise<Organization> {
    if (!this.cognitoUser.isAdmin()) throw new RCError('Unauthorized');

    this.organization = new Organization(this.body);
    this.organization.organizationId = await ddb.IUNID(PROJECT);

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Organization[]> {
    try {
      return (await ddb.scan({ TableName: DDB_TABLES.organizations }))
        .map((x: Organization) => new Organization(x))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      throw new RCError('Operation failed');
    }
  }
}
