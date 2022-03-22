# EGM 2022 app

**[How to contribute / developers guide](/CONTRIBUTING.md)**.

## Dictionary

- Participant (User): an ESNer joining the event.
- Admin: a User part of the group "admins", i.e. able to manage resources (Organizations, Speakers, Venues, Sessions, etc.).
- Organization: a company or entity that participates in the job fair and possibly holds some job/interview offer.
- Speaker: a person (not a user) holding a Session during the event.
- Venue: a physical location of the event; it can host Sessions.
- Session: a workshop, keynote, small session, etc. held by a Speaker in a Venue for a group of Participants.

## How to (re)create the app environment

Hello, there! This is a guide to deploy the app on a new environment.

**The back-end is implemented on AWS** ([Amazon Web Services](https://aws.amazon.com/)) resources. _Note: you don't need to have particular knowledge on AWS to complete this walkthrough._

### Pre-requirements

1. Choose an AWS account you own, or [create a new one](https://aws.amazon.com/getting-started/).
1. To completely automate the deployment process, make sure to [purchase a new domain name](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html) or import an existing one inside the [Route53](https://aws.amazon.com/route53) AWS service. _Note: for the domain `egm-app.link` purchased through Route53 we pay only 3$/year._
1. Identify an [AWS region](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/) to use, i.e. where all your cloud resources will be deployed. Suggested regions — since they are close and they support all the cloud resources we use in the project:
   - Frankfurt (`eu-central-1`),
   - Ireland (`eu-west-1`).
1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) and [configure the credentials linked to your AWS account](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
1. Install [NodeJS](https://nodejs.org/en/); the app is built on Typescript and NodeJS, so it's a mandatory development tool.
1. Install the [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html); this toolkit will deploy the app environment for us.
1. [Boostrap CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) in the account/region identified by running the terminal/prompt command:
   ```
   cdk bootstrap aws://ACCOUNT_ID/REGION
   ```

### Deployment

The suggested IDE is [Visual Studio Code](https://code.visualstudio.com/); we included some handy shortcuts built for it.

1. Open the project folder in the IDE.
1. Identify the file `/back-end/deploy/environments.ts` and fix the configuration with your values; explanation:
   - General parameters:
     - `project`: choose a key to identify the project and its resources; _tip: try not to use a key too simple, to avoid naming-overlapping on global resources._
     - `awsAccount`: the ID of the chosen AWS account (e.g. _123456789012_).
     - `awsRegion`: the ID of the chosen AWS region (e.g. _eu-central-1_); all the resources will be deployed there.
     - `apiDomain`: the domain name for the app's API, based on the domain you purchased/imported earlier. Examples: _api.yourdomain.com_, _api-project.yourdomain.com_, etc.
     - `mediaDomain`: the domain name where to locate app's media contents, based on the domain you purchased/imported earlier. Examples: _media.yourdomain.com_, _media-project.yourdomain.com_, etc.
     - `firstAdminEmail`: insert your email address to create the first (admin) user of the app.
   - Stage parameters; you can create as many enviroments (stages) as you like; a common configuration is with _prod_ and _dev_ stages, but you can also create only a production stage or whatever you like:
     - `domain`: the domain name where to reach the front-end for this stage, based on the domain you purchased/imported earlier. Examples: _yourdomain.com_, _dev.yourdomain.com_, etc.
     - `destroyDataOnDelete`: whether to delete the data when the stage is deleted; it should be **true** for _dev_ and **false** for _prod_ stages.
1. From the terminal/prompt, make sure to be in the `/back-end` folder of the project, substitute the STAGE variable (based on the stage/environment you want to deploy) and run:
   ```
   cdk deploy --context stage=STAGE --all --require-approval never --outputs-file output-config.json
   ```
1. _...it will take some time!_ If prompeted, confirm all the requests to create new resources.
1. At the end of the deployment, identify the generated file `/back-end/output-config.json` to get some important configurations to set in a few support files:

   - `/back-end/deploy.sh`: @todo
     - `PROJECT`
     - `AWS_REGION`
     - `AWS_PROFILE`: only if you need to use named profiles to identify the AWS account.
   - `/front-end/release.sh`: @todo
     - `PROJECT`
     - `AWS_REGION`
     - `AWS_PROFILE`: only if you need to use named profiles to identify the AWS account.
   - `/front-end/src/environment.tsx`:
     - Set the current stage (`CURRENT_STAGE`), i.e. the stage to run when the app is started.
     - Change the `url` _for each of the desired stages_.
     - Change the `apiUrl` with the API domain chosen.
     - Change the `mediaUrl` with the media domain chosen.
     - Set the `cognito` object with the attributes returned in the `output-config.json` file.

1. Repeat the deployment steps for each of the desired stages (e.g. _prod_, _dev_).

Note: some of the deployed resources are _stage-independant_ (i.e. they are in common between stages):

- User DB (Cognito),
- Media files (S3 Media Bucket),
- Map resource (Location Map).

_@todo: Document process to [request SES out-of-sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)._

```
aws sesv2 put-account-details \
--production-access-enabled \
--mail-type TRANSACTIONAL \
--website-url https://LINK_TO_FRONTEND \
--use-case-description "We send transactional emails following user-requested actions. All the target email addreses are verified. We implemented a mechanism to detect and manage bounces." \
--additional-contact-email-addresses YOUR_EMAIL_ADDRESS \
--contact-language EN
```
