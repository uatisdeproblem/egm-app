import { epochISOString, isEmpty, Resource } from 'idea-toolbox';

export class Communication extends Resource {
  /**
   * The communication ID.
   */
  communicationId: string;
  /**
   * The title of the communication.
   */
  title: string;
  /**
   * The content of the communication.
   */
  content: string;
  /**
   * The date of publishing for the communication.
   */
  publishedAt: epochISOString;
  /**
   * The URI for an image to display on this communication.
   */
  imageURI: string;

  // @todo do we add more stuff here? Push notifications, links, etc...

  load(x: any): void {
    super.load(x);
    this.communicationId = this.clean(x.communicationId, String);
    this.title = this.clean(x.title, String);
    this.content = this.clean(x.content, String);
    this.publishedAt = this.clean(x.publishedAt, t => new Date(t).toISOString(), new Date().toISOString());
    this.imageURI = this.clean(x.imageURI, String);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.communicationId = safeData.communicationId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.title)) e.push('title');
    if (isEmpty(this.content)) e.push('content');
    if (isEmpty(this.publishedAt, 'date')) e.push('publishedAt');
    return e;
  }
}

// @todo check if this is needed
export class CommunicationWithMarker extends Communication {
  hasBeenReadByUser?: boolean;

  load(x: any): void {
    super.load(x);
    if (x.hasBeenReadByUser) this.hasBeenReadByUser = true;
  }
}
