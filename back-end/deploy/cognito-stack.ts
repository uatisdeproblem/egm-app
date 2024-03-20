import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as Cognito from 'aws-cdk-lib/aws-cognito';
import { Duration } from 'aws-cdk-lib';

export interface CognitoProps extends cdk.StackProps {
  project: string;
  firstAdminEmail: string;
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: Cognito.UserPool;
  public readonly clientFrontEnd: Cognito.UserPoolClient;
  public readonly clientBackEnd: Cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoProps) {
    super(scope, id, props);

    this.userPool = new Cognito.UserPool(this, 'UserPool', {
      userPoolName: props.project,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireDigits: false,
        requireSymbols: false,
        requireUppercase: false,
        tempPasswordValidity: Duration.days(100)
      },
      accountRecovery: Cognito.AccountRecovery.EMAIL_ONLY,
      mfa: Cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
      email: Cognito.UserPoolEmail.withSES({ fromEmail: props.firstAdminEmail, fromName: 'EGM app' }),
      userVerification: {
        emailSubject: 'EGM app: password reset',
        emailBody:
          'Here is the verification link to reset your password: https://app.erasmusgeneration.org/auth/cognito?forgotPasswordCode={####}'
      }
    });
    new cdk.CfnOutput(this, 'CognitoUserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolARN', { value: this.userPool.userPoolArn });

    this.clientFrontEnd = new Cognito.UserPoolClient(this, 'CognitoUserPoolClientFrontEnd', {
      userPool: this.userPool,
      userPoolClientName: props.project.concat('-front-end'),
      generateSecret: false,
      preventUserExistenceErrors: true,
      authFlows: { custom: true, userSrp: true, userPassword: true }
    });
    new cdk.CfnOutput(this, 'ClientIdFrontEnd', { value: this.clientFrontEnd.userPoolClientId });

    this.clientBackEnd = new Cognito.UserPoolClient(this, 'CognitoUserPoolClientBackEnd', {
      userPool: this.userPool,
      userPoolClientName: props.project.concat('-back-end'),
      generateSecret: false,
      preventUserExistenceErrors: true,
      authFlows: { custom: true, userSrp: true, userPassword: true, adminUserPassword: true }
    });
    new cdk.CfnOutput(this, 'ClientIdBackEnd', { value: this.clientBackEnd.userPoolClientId });

    const adminsGroup = new Cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: 'admins',
      description: 'Administrators',
      precedence: 0,
      userPoolId: this.userPool.userPoolId
    });
    const user = new Cognito.CfnUserPoolUser(this, 'FirstAdminUser', {
      userPoolId: this.userPool.userPoolId,
      username: props.firstAdminEmail,
      desiredDeliveryMediums: ['EMAIL'],
      forceAliasCreation: true,
      userAttributes: [
        { name: 'email', value: props.firstAdminEmail },
        { name: 'email_verified', value: 'true' }
      ]
    });
    new Cognito.CfnUserPoolUserToGroupAttachment(this, 'FirstAdminInGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: String(adminsGroup.groupName),
      username: user.ref
    });
  }
}
