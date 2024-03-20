# This script serves the purpose of migrating the data from the dev tables to the prod tables.
# It is of the utmost importance that the data being passed is clean and consistent.

C='\033[4;32m' # color
NC='\033[0m'   # reset (no color)

# set the script to exit in case of errors
set -o errexit

# STEPS:

# We need first to install a specific Python script: dynamodump.
# pip install dynamodump
# OR
# pip3 install dynamodump

# Compile your parameters below:
DYNAMO_DUMP_LOCATION="/opt/homebrew/lib/python3.11/site-packages/dynamodump/dynamodump.py"
PROFILE="egm"
REGION="eu-central-1"
FROM="dev"
TO="prod"

VENUES_TABLE="venues"
ROOMS_TABLE="rooms"
ORGANIZATIONS_TABLE="organizations"
SPEAKERS_TABLE="speakers"
SESSIONS_TABLE="sessions"

# Backup data from your old account to your device
# The data is downloaded in the '~/dump' folder.

echo -e "${C}Downloading venues table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m backup -s egm-${FROM}-api_${VENUES_TABLE}
echo -e "${C}DONE!${NC}"
echo -e "${C}Downloading rooms table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m backup -s egm-${FROM}-api_${ROOMS_TABLE}
echo -e "${C}DONE!${NC}"
echo -e "${C}Downloading organizations table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m backup -s egm-${FROM}-api_${ORGANIZATIONS_TABLE}
echo -e "${C}DONE!${NC}"
echo -e "${C}Downloading speakers table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m backup -s egm-${FROM}-api_${SPEAKERS_TABLE}
echo -e "${C}DONE!${NC}"
echo -e "${C}Downloading sessions table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m backup -s egm-${FROM}-api_${SESSIONS_TABLE}
echo -e "${C}DONE!${NC}"


# Restore data from your device to the tables

echo -e "${C}Uploading venues table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m restore --skipThroughputUpdate -s egm-${FROM}-api_${VENUES_TABLE} -d egm-${TO}-api_${VENUES_TABLE} --dataOnly
echo -e "${C}DONE!${NC}"
echo -e "${C}Uploading rooms table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m restore --skipThroughputUpdate -s egm-${FROM}-api_${ROOMS_TABLE} -d egm-${TO}-api_${ROOMS_TABLE} --dataOnly
echo -e "${C}DONE!${NC}"
echo -e "${C}Uploading organizations table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m restore --skipThroughputUpdate -s egm-${FROM}-api_${ORGANIZATIONS_TABLE} -d egm-${TO}-api_${ORGANIZATIONS_TABLE} --dataOnly
echo -e "${C}DONE!${NC}"
echo -e "${C}Uploading speakers table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m restore --skipThroughputUpdate -s egm-${FROM}-api_${SPEAKERS_TABLE} -d egm-${TO}-api_${SPEAKERS_TABLE} --dataOnly
echo -e "${C}DONE!${NC}"
echo -e "${C}Uploading sessions table${NC}"
python3 ${DYNAMO_DUMP_LOCATION} --profile ${PROFILE} -r ${REGION} -m restore --skipThroughputUpdate -s egm-${FROM}-api_${SESSIONS_TABLE} -d egm-${TO}-api_${SESSIONS_TABLE} --dataOnly
echo -e "${C}DONE!${NC}"


# After moving the data you have to copy images from S3 dev to prod otherwise they are not available

# you can download it using this command
# sudo aws s3 cp --recursive s3://egm-media/ ./imagesS3 --profile egm

# and then you can upload it manually form the aws console. (remember we want the images and thumbnails folder)