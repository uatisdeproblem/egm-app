import { epochISOString, isEmpty, Resource } from 'idea-toolbox';

export class Communication extends Resource {
  communicationId: string;
  title: string;
  content: string;
  publishedAt: epochISOString;
  imageURI: string;

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

export class CommunicationWithMarker extends Communication {
  hasBeenReadByUser?: boolean;

  load(x: any): void {
    super.load(x);
    if (x.hasBeenReadByUser) this.hasBeenReadByUser = true;
  }
}
