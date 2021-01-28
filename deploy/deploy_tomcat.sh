#!/bin/sh

set -e

while [ ! $# -eq 0 ]
do
  case $1 in
    --prod)
      cd /home/deploy
      tar xf MICA.tar.xz
      rm -rf /usr/share/nginx/html/MICA
      mv MICA /usr/share/nginx/html/
      rm MICA.tar.xz
    ;;
    --dev)
      cd /home/deploy
      tar xf MICA.tar.xz
      rm -rf /usr/share/nginx/html/MICA
      mv MICA /usr/share/nginx/html/
      rm MICA.tar.xz
    ;;
   --pilot)
      cd /home/deploy
      tar xf MICA.tar.xz
      rm -rf /usr/share/nginx/html/MICA
      mv MICA /usr/share/nginx/html/
      rm MICA.tar.xz
    ;;

   esac
   echo "Deployment to ${1//-} is successfully finished."
   shift
done
