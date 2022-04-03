import { Resource } from 'idea-toolbox';

import { UserProfileShort, UserProfileSummary } from './userProfile';

export class Connection extends Resource {
  connectionId: string;
  requesterId: string;
  targetId: string;
  isPending?: boolean;

  load(x: any): void {
    super.load(x);
    this.connectionId = this.clean(x.connectionId, String);
    this.requesterId = this.clean(x.requesterId, String);
    this.targetId = this.clean(x.targetId, String);
    if (x.isPending) this.isPending = true;
  }
}

export class ConnectionWithUserData extends Connection {
  userProfile: UserProfileSummary | UserProfileShort;

  load(x: any): void {
    super.load(x);
    this.userProfile = this.isPending ? new UserProfileShort(x.userProfile) : new UserProfileSummary(x.userProfile);
  }
}
