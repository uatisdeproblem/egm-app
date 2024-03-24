import { Resource, epochISOString } from 'idea-toolbox';

/**
 * A contest to which people can vote in.
 */
export class Contest extends Resource {
  /**
   * The ID of the contest.
   */
  contestId: string;
  /**
   * Timestamp of creation (for sorting).
   */
  createdAt: epochISOString;
  /**
   * Whether the contest is enabled and therefore shown in the menu.
   */
  enabled: boolean;
  /**
   * If set, the vote is active (users can vote) and ends at the configured timestamp.
   */
  voteEndsAt?: epochISOString;
  /**
   * Name of the contest.
   */
  name: string;
  /**
   * Description of the contest.
   */
  description: string;
  /**
   * The URI to the contest's main image.
   */
  imageURI: string;
  /**
   * The candidates of the contest (vote ballots).
   */
  candidates: ContestCandidate[];
  /**
   * The count of votes for each of the sorted candidates.
   * Note: the order of the candidates list must not change after a vote is open.
   * This attribute is not accessible to non-admin users until `publishedResults` is true.
   */
  results?: number[];
  /**
   * Whether the results are published and hence visible to any users.
   */
  publishedResults: boolean;

  load(x: any): void {
    super.load(x);
    this.contestId = this.clean(x.contestId, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString(), new Date().toISOString());
    this.enabled = this.clean(x.enabled, Boolean, false);
    if (x.voteEndsAt) this.voteEndsAt = this.clean(x.voteEndsAt, t => new Date(t).toISOString());
    else delete this.voteEndsAt;
    this.name = this.clean(x.name, String);
    this.description = this.clean(x.description, String);
    this.imageURI = this.clean(x.imageURI, String);
    this.candidates = this.cleanArray(x.candidates, c => new ContestCandidate(c));
    this.results = [];
    for (let i = 0; i < this.candidates.length; i++) this.results[i] = Number(x.results[i] ?? 0);
    this.publishedResults = this.clean(x.publishedResults, Boolean, false);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.contestId = safeData.contestId;
    this.results = safeData.results;
    if (safeData.isVoteStarted()) {
      this.candidates = safeData.candidates;
    }
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.candidates)) e.push('candidates');
    this.candidates.forEach((c, index): void => c.validate().forEach(ea => e.push(`candidates[${index}].${ea}`)));
    return e;
  }

  /**
   * Whether the vote is started.
   */
  isVoteStarted(): boolean {
    return !!this.voteEndsAt;
  }
  /**
   * Whether the vote has started and ended.
   */
  isVoteEnded(): boolean {
    return this.isVoteStarted() && new Date().toISOString() > this.voteEndsAt;
  }
}

/**
 * A candidate in a contest.
 */
export class ContestCandidate extends Resource {
  /**
   * The name of the candidate.
   */
  name: string;
  /**
   * An URL where to find more info about the candidate.
   */
  url: string;
  /**
   * The country of the candidate.
   * This is particularly important beacuse, if set, users can't vote for candidates of their own countries.
   */
  country: string;

  load(x: any): void {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.url = this.clean(x.url, String);
    this.country = this.clean(x.country, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.url && this.iE(this.url, 'url')) e.push('url');
    return e;
  }
}
