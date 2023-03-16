# Docker 部署说明文档

* 安装docker

[https://docs.docker.com/docker-for-mac/](https://docs.docker.com/docker-for-mac/)

* 获取公共镜像

```
查看本地镜像：docker image ls
从公共仓库获取镜像: docker pull [镜像]
docker pull mongo
docker pull node
```

* 构建镜像

```
在项目根目录下创建Dockerfile文件
Dockerfile 指令

指定工作目录
WORKDIR <工作目录路径>

将项目下的文件复制到指定目录下
COPY package.json /usr/src/app/

启动容器安装依赖
RUN npm install

暴露端口
EXPOSE 3008

容器启动命令
CMD [ "npm", "start" ]
```

* compose 项目

参考文档:[https://yeasy.gitbooks.io/docker\_practice/content/compose/compose\_file.html](https://yeasy.gitbooks.io/docker_practice/content/compose/compose_file.html)

```
构建yml文件
设置容器信息

services:
  app:
    container_name: app
    restart: always
    build: .
    ports:
      - "3008:3008"
    links:
      - mongo
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - ./helper:/helper/db
    ports:
      - "27017:27017"
```

* 执行 docker-compose up 启动server\_app镜像的容器。

* 通过localhost:3008访问server

* 删除本地镜像

```
docker image rm [选项] <镜像1> <镜像2> ...
docker image rm server_app
```



