import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as S3 from 'aws-cdk-lib/aws-s3';
import * as IAM from 'aws-cdk-lib/aws-iam';
import * as CloudFront from 'aws-cdk-lib/aws-cloudfront';
import * as CloudFrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as ACM from 'aws-cdk-lib/aws-certificatemanager';
import * as Route53 from 'aws-cdk-lib/aws-route53';
import * as Route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';

export interface FrontEndProps extends cdk.StackProps {
  project: string;
  stage: string;
  domain: string;
}

export class FrontEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontEndProps) {
    super(scope, id, props);

    const frontEndBucket = new S3.Bucket(this, 'Bucket', {
      bucketName: props.project.concat('-', props.stage, '-front-end'),
      accessControl: S3.BucketAccessControl.PUBLIC_READ,
      websiteIndexDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY
    });
    frontEndBucket.addToResourcePolicy(
      new IAM.PolicyStatement({
        effect: IAM.Effect.ALLOW,
        principals: [new IAM.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`arn:aws:s3:::${frontEndBucket.bucketName}/*`]
      })
    );

    const zone = Route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domain.split('.').slice(-2).join('.')
    });

    const certificate = new ACM.DnsValidatedCertificate(this, 'Certificate', {
      domainName: props.domain,
      hostedZone: zone,
      region: 'us-east-1'
    });

    const frontEndDistribution = new CloudFront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new CloudFrontOrigins.S3Origin(frontEndBucket),
        compress: true,
        viewerProtocolPolicy: CloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      defaultRootObject: 'index.html',
      domainNames: [props.domain],
      priceClass: CloudFront.PriceClass.PRICE_CLASS_100,
      errorResponses: [
        { ttl: Duration.seconds(0), httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { ttl: Duration.seconds(0), httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' }
      ],
      certificate: ACM.Certificate.fromCertificateArn(this, 'CloudFrontCertificate', certificate.certificateArn)
    });

    new Route53.ARecord(this, 'DomainRecord', {
      zone: zone,
      recordName: props.domain,
      target: Route53.RecordTarget.fromAlias(new Route53Targets.CloudFrontTarget(frontEndDistribution))
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionID', { value: frontEndDistribution.distributionId });
    new cdk.CfnOutput(this, 'S3BucketName', { value: frontEndBucket.bucketName });
  }
}
