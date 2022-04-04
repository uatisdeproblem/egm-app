import { isEmpty, Resource } from 'idea-toolbox';

export class Message extends Resource {
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;

  load(x: any): void {
    super.load(x);
    this.messageId = this.clean(x.messageId, String);
    this.senderId = this.clean(x.senderId, String);
    this.senderName = this.clean(x.senderName, String);
    this.text = this.clean(x.text, String);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.messageId = safeData.messageId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.text)) e.push('message');
    if (this.senderName && isEmpty(this.senderName)) e.push('sender');
    return e;
  }
}
