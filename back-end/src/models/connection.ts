import { Resource } from 'idea-toolbox';

export class Connection extends Resource {
  connectionId: string;
  requesterId: string;
  targetId: string;

  load(x: any): void {
    super.load(x);
    this.connectionId = this.clean(x.connectionId, String);
    this.requesterId = this.clean(x.requesterId, String);
    this.targetId = this.clean(x.targetId, String);
  }
}
