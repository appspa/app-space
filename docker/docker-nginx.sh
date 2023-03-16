#!/bin/sh
cp /app/docker/nginx/nginx.conf /etc/nginx/conf.d/server.conf
exec nginx -g 'daemon off;'
