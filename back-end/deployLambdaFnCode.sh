#!/bin/bash

# parameters
AWS_PROFILE=$1
AWS_REGION=$2
PROJECT=$3
HANDLER=$4
ENVIRONMENT='dev' # leave empty if the project uses environment-independent Lambda functions
SRC_PATH="${PWD}/src"
HANDLERS_PATH="${SRC_PATH}/handlers"
OUT_ZIP_FILE='_out.zip'
C='\033[4;32m' # color
NC='\033[0m'   # reset (no color)

# disable pagination in aws cli commands
export AWS_PAGER=""

# set the script to exit in case of errors
set -o errexit

if [ "${HANDLER}" == "" ] || [ ! -f "${HANDLERS_PATH}/${HANDLER}.ts" ]
then
   >&2 echo -e "${C}Error: handler not found!${NC}"
  exit -1
fi

if [ "${ENVIRONMENT}" != "" ]
then
  FUNCTION_NAME=${PROJECT}_${ENVIRONMENT}_${HANDLER}
else
  FUNCTION_NAME=${PROJECT}_${HANDLER}
fi

echo -e "${C}NOTE WELL: use the 'quick' option solely in case only the code of the function has changed.\nOther changes (e.g. lambda env variables, npm libs, API, tables, etc.) require a full deploy!${NC}\n"
echo -e "${C}Quickly updating the Lambda function: ${FUNCTION_NAME}${NC}"

# lint the code in search for errors
echo -e "${C}\tLinting...${NC}"
npm run lint ${HANDLERS_PATH}/${HANDLER}.ts 1>/dev/null

# compile the project's typescript code
echo -e "${C}\tCompiling...${NC}"
npm run build -- ${HANDLERS_PATH}/${HANDLER}.ts 1>/dev/null

# create a zip archive of the .js files of the build
echo -e "${C}\tPacking...${NC}"
cd ${SRC_PATH}
zip "${OUT_ZIP_FILE}" . -q -r -i *.js -i *.js.map

# upload the zip archive to the lambda function of the specified handler
echo -e "${C}\tUploading...${NC}"
aws lambda update-function-code \
--function-name ${FUNCTION_NAME} \
--zip-file fileb://${OUT_ZIP_FILE} \
--profile ${AWS_PROFILE} --region ${AWS_REGION} \
1>/dev/null

# cleaning: remove the zip archive
echo -e "${C}\tCleaning...${NC}"
rm ${OUT_ZIP_FILE}

echo -e "${C}Done!${NC}"