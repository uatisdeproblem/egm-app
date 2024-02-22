///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';
import { AppStatus, InternalAppVersionStatus } from 'idea-toolbox';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const DDB_TABLES = { status: process.env.DDB_TABLE_status };
const ddb = new DynamoDB();

const LATEST_VERSION = process.env.LATEST_VERSION;
const MIN_VERSION = process.env.MIN_VERSION;
const MAINTENANCE = Boolean(process.env.MAINTENANCE);

export const handler = (ev: any, _: any, cb: any): Promise<void> => new Status(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class Status extends ResourceController {
  internalVersionStatus: InternalAppVersionStatus;

  protected async checkAuthBeforeRequest(): Promise<void> {
    if (!this.clientVersion) this.clientVersion = LATEST_VERSION;
    this.internalVersionStatus = await this.getInternalVersionStatus(this.clientVersion);
  }
  private async getInternalVersionStatus(version: string): Promise<InternalAppVersionStatus> {
    try {
      return (await ddb.get({ TableName: DDB_TABLES.status, Key: { version } })) as InternalAppVersionStatus;
    } catch (err) {
      if (String(err) === 'Error: Not found') return { version } as InternalAppVersionStatus;
      else throw new HandledError('Failed to check version');
    }
  }

  protected async getResources(): Promise<AppStatus> {
    return new AppStatus({
      version: this.internalVersionStatus.version,
      inMaintenance: MAINTENANCE,
      mustUpdate: MIN_VERSION ? MIN_VERSION > this.internalVersionStatus.version : false,
      content: this.internalVersionStatus.message,
      latestVersion: LATEST_VERSION
    });
  }
}
