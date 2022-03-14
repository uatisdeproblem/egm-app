import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as Route53 from 'aws-cdk-lib/aws-route53';
import { DnsValidatedDomainIdentity } from 'aws-cdk-ses-domain-identity';

export interface SESProps extends cdk.StackProps {
  domain: string;
}

export class SESStack extends cdk.Stack {
  public readonly identityARN: string;

  constructor(scope: Construct, id: string, props: SESProps) {
    super(scope, id, props);

    const domainName = props.domain.split('.').slice(-2).join('.');

    const hostedZone = Route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName
    });

    const identity = new DnsValidatedDomainIdentity(this, 'DomainIdentity', {
      domainName,
      dkim: true,
      region: cdk.Stack.of(this).region,
      hostedZone
    });
    this.identityARN = identity.identityArn;

    new cdk.CfnOutput(this, 'SESIdentityARN', { value: this.identityARN });
  }
}
