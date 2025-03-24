import { isEmpty, Resource } from 'idea-toolbox';

export class Organization extends Resource {
  /**
   * The organization ID.
   */
  organizationId: string;
  /**
   * The name of the organization.
   */
  name: string;
  /**
   * The URI for an image describing the organization
   */
  imageURI: string;
  /**
   * A description of the organization.
   */
  description: string;
  /**
   * The organization's website.
   */
  website: string;
  /**
   * The organization's contact email.
   */
  contactEmail: string;

  load(x: any): void {
    super.load(x);
    this.organizationId = this.clean(x.organizationId, String);
    this.name = this.clean(x.name, String);
    this.imageURI = this.clean(x.imageURI, String);
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
    return e;
  }

  /**
   * Return an exportable flat version of the resource.
   */
  exportFlat(): OrganizationFlat {
    return new OrganizationFlat(this);
  }

  /**
   * Import a flat structure and set the internal attributes accordingly.
   */
  importFlat(x: OrganizationFlat): void {
    this.organizationId = x['Organization ID'];
    this.name = x['Organization name'];
    this.description = x['Description'];
    this.website = x['Website'];
    this.contactEmail = x['Contact Email'];
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

/**
 * A flat version of the resource, useful for exports.
 */
export class OrganizationFlat {
  'Organization ID': string;
  'Organization name': string;
  'Description': string;
  'Website': string;
  'Contact Email': string;

  constructor(x?: Organization) {
    x = x || ({} as any);
    this['Organization ID'] = x.organizationId;
    this['Organization name'] = x.name;
    this['Description'] = x.description;
    this['Website'] = x.website;
    this['Contact Email'] = x.contactEmail;
  }
}
