import { Resource } from 'idea-toolbox';
import { AuthServices } from './user.model';

/**
 * A useful link for the users to access more contents and information.
 */
export class UsefulLink extends Resource {
  /**
   * The ID of the link.
   */
  linkId: string;
  /**
   * The title of the link.
   */
  name: string;
  /**
   * The URL of the link.
   */
  url: string;
  /**
   * The audience to which the link refers to.
   */
  audience: string;
  /**
   * The sort index to order the link in lists.
   */
  sort: number;

  /**
   * The target people that can view the link
   */
  visibleTo: AuthServices[];

  load(x: any): void {
    super.load(x);
    this.linkId = this.clean(x.linkId, String);
    this.name = this.clean(x.name, String);
    this.url = this.clean(x.url, String);
    this.audience = this.clean(x.audience, String);
    this.sort = this.clean(x.sort, Number, Date.now());
    if (!x.visibleTo) this.visibleTo = [AuthServices.ESN_ACCOUNTS, AuthServices.COGNITO];
    else this.visibleTo = this.cleanArray(x.visibleTo, String);

    const typesOfUsers: string[] = Object.values(AuthServices);
    this.visibleTo = this.visibleTo.filter(t => typesOfUsers.includes(t));
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.linkId = safeData.linkId;
    this.sort = safeData.sort;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.url, 'url')) e.push('url');
    if (!this.visibleTo?.length) e.push('visibleTo');
    return e;
  }
}
