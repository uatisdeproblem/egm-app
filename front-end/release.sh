#!/bin/bash

# project specific parameters
S3_BUCKET_PROD='egm-prod-front-end'
S3_BUCKET_DEV='egm-dev-front-end'
CLOUDFRONT_DISTRIBUTION_PROD='E1SC6WGQUI6XWJ'
CLOUDFRONT_DISTRIBUTION_DEV='E1WBM1Y7S111BZ'
AWS_REGION='eu-central-1'
AWS_PROFILE='egm' # leave empty if not used

# other parameters
ACTION=$1
SRC_FOLDER="${PWD}/src"
BACK_END_FOLDER="back-end"
C='\033[4;32m' # color
NC='\033[0m'   # reset (no color)

# disable pagination in aws cli commands
export AWS_PAGER=""

# set the script to exit in case of errors
set -o errexit

# parameters validation
if [ "${ACTION}" != "dev" ] && [ "${ACTION}" != "prod" ]
then
  echo -e "${C}Target environment: dev|prod${NC}"
  echo -e "${C}\t - dev:    release the front-end in the development environment${NC}"
  echo -e "${C}\t - prod:   release the front-end in the production environment${NC}"
  exit -1
fi

if [ "${ACTION}" == 'dev' ]
then
  ENVIRONMENT='DEVELOPMENT'
  BUCKET="s3://${S3_BUCKET_DEV}"
  DISTRIBUTION=${CLOUDFRONT_DISTRIBUTION_DEV}
else
  ENVIRONMENT='PRODUCTION'
  BUCKET="s3://${S3_BUCKET_PROD}"
  DISTRIBUTION=${CLOUDFRONT_DISTRIBUTION_PROD}
fi

# install the npm modules
echo -e "${C}Installing npm modules...${NC}"
npm i --silent 1>/dev/null

# compile the project's typescript code
echo -e "${C}Compiling...${NC}"
ionic build --prod 1>/dev/null

# upload the project's files to the S3 bucket
echo -e "${C}Uploading...${NC}"
aws s3 sync ./build ${BUCKET} --profile ${AWS_PROFILE} --region ${AWS_REGION} \
  --exclude ".well-known/*"  1>/dev/null

# invalidate old common files from the CloudFront distribution
echo -e "${C}Cleaning...${NC}"
aws cloudfront create-invalidation --profile ${AWS_PROFILE} --region ${AWS_REGION} \
  --distribution-id ${DISTRIBUTION} \
  --paths "/index.html" "/assets/i18n*" \
  1>/dev/null

echo -e "${C}Done!${NC}"