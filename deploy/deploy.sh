#!/bin/sh

set -e

DEV_URL="deploy@34.236.230.215"
#DEV_KEY_FILE_NAME="deploy.pem"

PILOT_URL="deploy@54.67.71.69"
#PILOT_KEY_FILE_NAME="deploy.pem"

PROD_URL="deploy@13.56.40.133"
#PROD_KEY_FILE_NAME="deploy.pem"

deploy() {
  if [ $URL ] && [ $FLAG ] ; then
    scp   deploy/MICA.tar.xz $URL:
    ssh   $URL 'bash -s' -- < ./deploy/deploy_tomcat.sh $FLAG
#    rm deploy/MICA.tar.xz
  else
    echo "Please specify environment [ --prod | --dev | --pilot ]."
    exit
  fi
}

while [ ! $# -eq 0 ]
do
  case $1 in
    --dev)
      URL=$DEV_URL
      # KEY_FILE_NAME=$DEV_KEY_FILE_NAME
    ;;

    --pilot)
      URL=$PILOT_URL
      # KEY_FILE_NAME=$PILOT_KEY_FILE_NAME
    ;;

    --prod)
      URL=$PROD_URL
      # KEY_FILE_NAME=$PROD_KEY_FILE_NAME
    ;;
  esac
  FLAG=$1
  shift
done

deploy
