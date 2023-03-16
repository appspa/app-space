FROM nginx:1.17.6-alpine

ADD docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

#COPY cert/* /etc/nginx/ssl/
USER root
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8089/tcp
