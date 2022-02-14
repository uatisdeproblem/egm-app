import { isEmpty, Resource } from 'idea-toolbox';

export class Organization extends Resource {
  organizationId: string;
  name: string;
  description: string;
  website: string;
  contactEmail: string;

  load(x: any): void {
    super.load(x);
    this.organizationId = this.clean(x.organizationId, String);
    this.name = this.clean(x.name, String);
    this.description = this.clean(x.description, String);
    this.website = this.clean(x.website, String);
    this.contactEmail = this.clean(x.contactEmail, String);
  }
  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.organizationId = safeData.organizationId;
  }
  validate(): string[] {
    const e = super.validate();
    if (isEmpty(this.name)) e.push('name');
    if (this.website && isEmpty(this.website, 'url')) e.push('website');
    if (this.contactEmail && isEmpty(this.contactEmail, 'email')) e.push('contactEmail');
    return e;
  }
}

export class OrganizationLinked extends Resource {
  organizationId: string;
  name: string;

  load(x: any): void {
    super.load(x);
    this.organizationId = this.clean(x.organizationId, String);
    this.name = this.clean(x.name, String);
  }
}
