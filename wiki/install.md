安装部署

#### 安装前准备

* 安装 MongoDB
* 安装 Nodejs
* 安装 pm2、babel-node

```bash
npm install -g pm2 babel-cli
```

* 安装 cnpm

```bash
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

#### 安装步骤

1.clone 下载代码

```bash
//进入项目根目录

cnpm install  //安装依赖

//配置前端接口请求的baseUrl和后端运行的端口号
node app config -u https://appspace -p 8085

//启动项目
node app start -i -b
```

2.配置 nginx

可以按照项目根目录的 appspace_nginx.conf 文件进行配置

```bash
server{
  listen 80;
  server_name appspace;

  #root目录为项目根目录的client/dist目录下
  root /home/ubuntu/appspace/client/dist;
  index index.html;

  location / {
      try_files $uri $uri/ @router;
      index index.html;
  }

  location /upload/ {
      #该目录为根目录下config文件里配置的文件上传目录
      #或者使用node app config 配置的updateDir
      root /home/ubuntu/appspace/upload
      expires  30d;
  }

  location @router {
      rewrite ^.*$ /index.html last;
  }


  location /api/ {
    proxy_pass http://127.0.0.1:8383;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
  client_max_body_size 208M;
}
```
