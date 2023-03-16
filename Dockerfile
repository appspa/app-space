FROM node:14.16.1-alpine AS build

RUN npm config set registry https://registry.npm.taobao.org/
# 设置目录
RUN mkdir -p /app/data /app/server /app/client/dist  /app/docker

# copy docker  file
WORKDIR /app/docker
ADD docker /app/docker

## 前端页
WORKDIR /app/client/dist
ADD client/dist /app/client/dist

# 增加server
WORKDIR /app/server
ADD server /app/server
RUN npm install

EXPOSE 80/tcp

ENTRYPOINT ["/app/docker/docker-entrypoint.sh"]
