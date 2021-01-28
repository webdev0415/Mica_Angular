#!/bin/bash

echo "Decompressing files..."
tar xvf ./deploy/MICA.tar.xz
cp -auvx MICA/* /usr/share/nginx/html/MICA/
cp -auvx MICA /usr/share/nginx/html/MICA/

/etc/init.d/filebeat start

exec "$@"
