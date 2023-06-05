import os from "os";

let fs = require('fs');
let path = require('path');


const config = {
  // baseUrl: process.env.APP_SPA_DOMAIN || "http://127.0.0.1:80", //baseUrl应用请求的url地址,比如https://appspace
  // port: process.env.APP_SPA_PORT || '80', //server运行的端口
  baseUrl: process.env.APP_SPA_DOMAIN || "http://127.0.0.1:8081", //baseUrl应用请求的url地址,比如https://appspace
  host: process.env.APP_SPA_HOST || "0.0.0.0", //host railway
  port: process.env.APP_SPA_PORT || '8081', //server运行的端口

  iosPlistSource: 'api', //[api,yun] api通过接口获取 yun通过云盘接口获取（前提有云盘存储） 解决ios本地无https接口 用云盘方案
  //解决局域网iOS https证书 临时体验用
  iosInstallUrl: undefined, // "https://127.0.0.1:443"
  // iosInstallPort: "443",//undefined
  apiPrefix: 'api',
  secret: process.env.APP_SPA_SECRET || 'secret', //secret
  dbUser: process.env.APP_SPA_DBUSER || 'mongo', //数据库用户 (没有开启mongodb用户认证的可以不填写)
  dbPass: process.env.APP_SPA_DBPWD || 'bWHy6ZBakeOx0oMV3fG', //数据库密码 (没有开启mongodb用户认证的可以不填写)
  dbName: process.env.APP_SPA_DB_NAME || 'app_space',//'app_space', //数据库名称
  dbHost: process.env.APP_SPA_DB_HOST ||'containers-us-west-181.railway.app',// 'mongo',// '127.0.0.1', //数据库地址

  dbPort: process.env.APP_SPA_DB_PORT || '6106', //数据库端口

  emailService: process.env.APP_SPA_EMAIL_SERVICE || 'qq', //邮件相关配置 用于找回密码和邀请团队成员发送邮件
  emailUser: process.env.APP_SPA_EMAIL_USER || '',
  emailPass: process.env.APP_SPA_EMAIL_PASS || '',
  emailPort: process.env.APP_SPA_EMAIL_PORT || '587',

  allowRegister: boolConfig(process.env.APP_SPA_ALLOW_REGISTER || 'false'), //是否允许用户注册,为否则后端注册接口不可用
  adminAccount: process.env.APP_SPA_ADMIN_ACCOUNT || 'admin',
  adminPassword: process.env.APP_SPA_ADMIN_PASSWORD || 'app@space',

  openLdap: boolConfig(process.env.APP_SPA_ALLOW_LDAP || 'false'), //是否开启ldap 默认是false 如果公司没有ldap服务可以不用理会
  ldapServer: process.env.APP_SPA_LDAP_URL || '', //ldap server url
  ldapUserDn: process.env.APP_SPA_LDAP_USERDN || '', //ldap管理员dn 也就是管理员用户名
  ldapBindCredentials: process.env.APP_SPA_LDAP_CREDENTIALS || '', //ldap管理员密码
  ldapBase: process.env.APP_SPA_LDAP_BASE || '', //ldap base

  storageType: process.env.STORAGE_TYPE || 'local', //"s3",
  storageDir: process.env.STORAGE_DIR || '/data/storage',//path.join(__dirname, '../docker/storage'),

  // Config for local storage when storageType value is "local".
  local: {
    // downloadUrl
    // downloadUrl: process.env.APP_SPA_DOMAIN || "http://10.151.100.79:80",
    downloadUrl: process.env.APP_SPA_DOMAIN || "http://192.168.1.10:8085",
  },
  // Config for qiniu (http://www.qiniu.com/) cloud storage when storageType value is "qiniu".
  qiniu: {
    accessKey: process.env.QIN_IU_ACCESS_KEY,
    secretKey: process.env.QIN_IU_SECRET_KEY,
    bucketName: process.env.QIN_IU_BUCKET_NAME,
    downloadUrl: process.env.QIN_IU_DOWNLOAD_URL // Binary files download host address.
  },
  // Config for upyun (https://www.upyun.com/) storage when storageType value is "upyun"
  upyun: {
    storageDir: process.env.UP_YUN_STORAGE_DIR,
    serviceName: process.env.UP_YUN_SERVICE_NAME,
    operatorName: process.env.UP_YUN_OPERATOR_NAME,
    operatorPass: process.env.UP_YUN_OPERATOR_PASS,
    downloadUrl: process.env.UP_YUN_DOWNLOAD_URL,
  },

  // Config for Amazon s3 (https://aws.amazon.com/cn/s3/) storage when storageType value is "s3".
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '', //(optional)
    bucketName: process.env.AWS_BUCKET_NAME || 't',
    region: process.env.AWS_REGION || '',
    downloadUrl: process.env.AWS_DOWNLOAD_URL||'', // binary files download host address.
  },
  // Config for tencentyun COS (https://cloud.tencent.com/product/cos) when storageType value is "oss".
  tencentcloud: {
    accessKeyId: process.env.TENCENT_CLOUD_ACCESS_KEY_ID,
    secretAccessKey: process.env.TENCENT_CLOUD_SECRET_ACCESS_KEY,
    bucketName:process.env.TENCENT_CLOUD_BUCKET_NAME,
    region: process.env.TENCENT_CLOUD_REGION,
    downloadUrl: process.env.TENCENT_CLOUD_DOWNLOAD_URL, // binary files download host address.
  },
  // Config for Aliyun OSS (https://www.aliyun.com/product/oss) when storageType value is "oss".
  oss: {
    accessKeyId:  process.env.OSS_ACCESS_KEY_ID,
    secretAccessKey:  process.env.OSS_SECRET_ACCESS_KEY,
    endpoint:  process.env.OSS_ENDPOINT,
    bucketName:  process.env.OSS_BUCKET_NAME,
    prefix:  process.env.OSS_PREFIX, // Key prefix in object key
    downloadUrl:  process.env.OSS_DOWNLOAD_URL, // binary files download host address.
  },

  jwt: {
    // Recommended: 63 random alpha-numeric characters
    // Generate using: https://www.grc.com/passwords.htm
    tokenSecret: process.env.TOKEN_SECRET || 'INSERT_RANDOM_TOKEN_KEY'
  },

  // Config for smtp email，register module need validate user email project source https://github.com/nodemailer/nodemailer
  smtpConfig: {
    host: "smtp.aliyun.com",
    port: 465,
    secure: true,
    auth: {
      user: "",
      pass: ""
    }
  },
  // Config for redis (register module, tryLoginTimes module)
  redis: {
    default: {
      host: "127.0.0.1",
      port: 6379,
      retry_strategy: function (options) {
        if (options.error.code === 'ECONNREFUSED') {
          // End reconnecting on a specific error and flush all commands with a individual error
          return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands with a individual error
          return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
          // End reconnecting with built in error
          return undefined;
        }
        // reconnect after
        return Math.max(options.attempt * 100, 3000);
      }
    }
  },
  log4js: {
    appenders: {console: {type: 'console'}},
    categories: {
      "default": {appenders: ['console'], level: 'all'},
      "startup": {appenders: ['console'], level: 'all'},
      "http": {appenders: ['console'], level: 'all'}
    }
  }
};

function boolConfig(str) {
  return str === 'true'
}

export default config;
