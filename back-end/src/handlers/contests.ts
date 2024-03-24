///
/// IMPORTS
///

import { DynamoDB, HandledError, ResourceController } from 'idea-aws';

import { Contest } from '../models/contest.model';
import { User } from '../models/user.model';

///
/// CONSTANTS, ENVIRONMENT VARIABLES, HANDLER
///

const PROJECT = process.env.PROJECT;
const DDB_TABLES = { users: process.env.DDB_TABLE_users, contests: process.env.DDB_TABLE_contests };
const ddb = new DynamoDB();

export const handler = (ev: any, _: any, cb: any): Promise<void> => new ContestsRC(ev, cb).handleRequest();

///
/// RESOURCE CONTROLLER
///

class ContestsRC extends ResourceController {
  user: User;
  contest: Contest;

  constructor(event: any, callback: any) {
    super(event, callback, { resourceId: 'contestId' });
  }

  protected async checkAuthBeforeRequest(): Promise<void> {
    try {
      this.user = new User(await ddb.get({ TableName: DDB_TABLES.users, Key: { userId: this.principalId } }));
    } catch (err) {
      throw new HandledError('User not found');
    }

    if (!this.resourceId) return;

    try {
      this.contest = new Contest(
        await ddb.get({ TableName: DDB_TABLES.contests, Key: { contestId: this.resourceId } })
      );
    } catch (err) {
      throw new HandledError('Contest not found');
    }
  }

  protected async getResource(): Promise<Contest> {
    if (!this.user.permissions.canManageContents && !this.contest.publishedResults) delete this.contest.results;
    return this.contest;
  }

  protected async putResource(): Promise<Contest> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    const oldResource = new Contest(this.contest);
    this.contest.safeLoad(this.body, oldResource);

    return await this.putSafeResource();
  }
  private async putSafeResource(opts: { noOverwrite?: boolean } = {}): Promise<Contest> {
    const errors = this.contest.validate();
    if (errors.length) throw new HandledError(`Invalid fields: ${errors.join(', ')}`);

    const putParams: any = { TableName: DDB_TABLES.contests, Item: this.contest };
    if (opts.noOverwrite) putParams.ConditionExpression = 'attribute_not_exists(contestId)';
    await ddb.put(putParams);

    return this.contest;
  }

  protected async patchResource(): Promise<void> {
    switch (this.body.action) {
      case 'VOTE':
        return await this.userVote(this.body.candidate);
      case 'PUBLISH_RESULTS':
        return await this.publishResults();
      default:
        throw new HandledError('Unsupported action');
    }
  }
  private async userVote(candidateName: string): Promise<void> {
    if (!this.contest.isVoteStarted() || this.contest.isVoteEnded()) throw new HandledError('Vote is not open');

    if (this.user.isExternal()) throw new HandledError("Externals can't vote");
    if (!this.user.spot?.paymentConfirmedAt) throw new HandledError("Can't vote without confirmed spot");

    const candidateIndex = this.contest.candidates.findIndex(c => c.name === candidateName);
    if (candidateIndex === -1) throw new HandledError('Candidate not found');

    const candidateCountry = this.contest.candidates[candidateIndex].country;
    if (candidateCountry && candidateCountry === this.user.sectionCountry)
      throw new HandledError("Can't vote for your country");

    const markUserContestVoted = {
      TableName: DDB_TABLES.users,
      Key: { userId: this.user.userId },
      ConditionExpression: 'attribute_not_exists(votedInContests) OR NOT contains(votedInContests, :contestId)',
      UpdateExpression: 'SET votedInContests = list_append(if_not_exists(votedInContests, :emptyArr), :contestList)',
      ExpressionAttributeValues: {
        ':contestId': this.contest.contestId,
        ':contestList': [this.contest.contestId],
        ':emptyArr': [] as string[]
      }
    };
    const addUserVoteToContest = {
      TableName: DDB_TABLES.contests,
      Key: { contestId: this.contest.contestId },
      UpdateExpression: `ADD results[${candidateIndex}] :one`,
      ExpressionAttributeValues: { ':one': 1 }
    };

    await ddb.transactWrites([{ Update: markUserContestVoted }, { Update: addUserVoteToContest }]);
  }
  private async publishResults(): Promise<void> {
    if (this.contest.publishedResults) throw new HandledError('Already public');

    if (!this.contest.voteEndsAt || new Date().toISOString() <= this.contest.voteEndsAt)
      throw new HandledError('Vote is not done');

    await ddb.update({
      TableName: DDB_TABLES.contests,
      Key: { contestId: this.contest.contestId },
      UpdateExpression: 'SET publishedResults = :true',
      ExpressionAttributeValues: { ':true': true }
    });
  }

  protected async deleteResource(): Promise<void> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    await ddb.delete({ TableName: DDB_TABLES.contests, Key: { contestId: this.resourceId } });
  }

  protected async postResources(): Promise<Contest> {
    if (!this.user.permissions.canManageContents) throw new HandledError('Unauthorized');

    this.contest = new Contest(this.body);
    this.contest.contestId = await ddb.IUNID(PROJECT);
    this.contest.createdAt = new Date().toISOString();
    this.contest.enabled = false;
    delete this.contest.voteEndsAt;
    this.contest.results = [];
    this.contest.candidates.forEach((): number => this.contest.results.push(0));
    this.contest.publishedResults = false;

    return await this.putSafeResource({ noOverwrite: true });
  }

  protected async getResources(): Promise<Contest[]> {
    let contests = (await ddb.scan({ TableName: DDB_TABLES.contests })).map(x => new Contest(x));

    if (!this.user.permissions.canManageContents) {
      contests = contests.filter(c => c.enabled);
      contests.forEach(contest => {
        if (contest.publishedResults) delete contest.results;
      });
    }

    return contests.sort((a, b): number => b.createdAt.localeCompare(a.createdAt));
  }
}
