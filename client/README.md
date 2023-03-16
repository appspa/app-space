# app-publisher

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

```
###1.更新代码
Modify code

###2. 编译 image
docker build -t answerhuang/appspace:latest -f docker/Dockerfile .


###3. 推送到 docker hub
docker push answerhuang/appspace:latest


###4. 需要发布的机器拉取最新的镜像
docker pull answerhuang/appspace:latest


###5. 重新创建容器
docker-compose up -d --build
```
