### 镜像构建说明

- server
    基于node构建server服务
- Mongo
    


# Docker 部署说明文档

- 安装docker和Docker-compose最新版
  https://docs.docker.com/docker-for-mac/

使用docker-compose部署：
>  - compose 项目
参考文档:https://yeasy.gitbooks.io/docker_practice/content/compose/compose_file.html

docker-compose中包含server服务和mongodb，如果已经单独运行了mongodb可以直接用Dockerfile构建。
https://github.com/jaywcjlove/docker-tutorial
 ```
构建yml文件
设置容器信息

version: '3'
services:

  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - ./data:/data/db
    ports:
      - "27017:27017"
    networks:
      - appnet

  server:
    build:
      context: ../
      dockerfile: docker/Dockerfile
    environment:
      FABU_DB_HOST: mongo
      FABU_BASE_URL: https://fabu.apppills.com  #这是服务器部署的地址，请换成自己的 本地运行demo可以删除本行
      FABU_UPLOAD_DIR: /fabu/upload 
    ports: 
      - "8085:8085"
    volumes:
      - ./upload:/fabu/upload
    depends_on:
      - mongo
    networks:
      - appnet

networks:
  appnet:
    driver:
      bridge

 ```

进入docker目录中：
执行：
```
docker-compose up -d --build
```

# 导出镜像
docker build -t appspace:v1 .

# 构建部署
docker login ghcr.io -u $NAMESPACE -p $PERSONAL_ACCESS_TOKEN
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

docker-compose up -d --build 

