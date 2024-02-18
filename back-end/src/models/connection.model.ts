import { Resource } from 'idea-toolbox';
import { User } from './user.model';

export class Connection extends Resource {
  /**
   * The ID of the connection.
   */
  connectionId: string;
  /**
   * The user ID requesting a connection.
   */
  requesterId: string;
  /**
   * The target user ID of the connection.
   */
  targetId: string;
  /**
   * Wether the connection request is pending or not.
   */
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
  userProfile: User;

  load(x: any): void {
    super.load(x);
    this.userProfile = new User(x.userProfile);
  }
}
