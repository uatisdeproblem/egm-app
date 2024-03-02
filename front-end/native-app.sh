#!/bin/bash

# parameters
PLATFORM=$1
ACTION=$2

# parameters validation
if [ "${PLATFORM}" == "" ] || [ "${ACTION}" == "" ]
then
  echo -e "\033[94m
    Parameters: ios|android run|release
  \033[0m"
  exit -1
fi
if [ "${ACTION}" == "" ]
then
  echo -e "\033[94m
    \t - run:       build and run on physical device or emulator
    \t - release:   build a package to release in the store
  \033[0m"
  exit -1
fi

if [ "${ACTION}" == "run" ]
then
  ionic build
  npx cap copy
  npx cap run ${PLATFORM}
fi
if [ "${ACTION}" == "release" ]
then
  ionic build --prod
  npx cap copy
  npx cap open ${PLATFORM}
fi