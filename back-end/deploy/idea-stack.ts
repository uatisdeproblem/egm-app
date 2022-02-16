import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as DDB from 'aws-cdk-lib/aws-dynamodb';

export class IDEAStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new DDB.Table(this, 'idea_IUNID', {
      tableName: 'idea_IUNID',
      partitionKey: { name: 'project', type: DDB.AttributeType.STRING },
      sortKey: { name: 'id', type: DDB.AttributeType.STRING },
      billingMode: DDB.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true
    });

    new DDB.Table(this, 'idea_atomicCounters', {
      tableName: 'idea_atomicCounters',
      partitionKey: { name: 'key', type: DDB.AttributeType.STRING },
      billingMode: DDB.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true
    });
  }
}
