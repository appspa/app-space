// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
import router from './controller';
import config from './config';

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
    // 导入controller middleware:
const rest = require('./utils/rest')
const serve = require('koa-static');
const cors = require('koa-cors')
const koajwt = require('koa-jwt')
import path from 'path'
import fs from'fs'

import Verify from './utils/verify'
import Helper from './utils/MiddleHelper'
import { isNull, isUndefined } from 'util';
import _ from "lodash";
import common from "./utils/common";
const log4js = require('log4js');
const  log = log4js.getLogger("cps:index");
import AuthRouter from  "./controllers/auth"
const app = new Koa()
log4js.configure(_.get(config, 'log4js', {
    appenders: {console: { type: 'console'}},
    categories : { default: { appenders: ['console'], level: 'info' }}
}));
log4js.getLogger("startup")

const  helper = new Helper()
// 中间件 自定义了 401 响应，将用户验证失败的相关信息返回给浏览器
app.use(function(ctx, next){
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.body = 'Protected resource, use Authorization header to get access\n';
        } else {
            throw err;
        }
    });
});
app.use(cors())
app.use(bodyParser())
// app.use(serve(path.join(__dirname, 'public')));
// app.use(serve(path.resolve(config.fileDir)))
app.use(serve(path.join(__dirname, '..', 'client/dist')));
common.initStorageDir().then(r => log.debug('storage dir=', r));
app.use(serve(common.getStorageDir()));
app.use(function(ctx, next) {
    console.log('ctx.request',ctx.request.path)
  // 不是以 api 开头的请求, 返回前端页面.
  if (ctx.request.path.split('/').filter(item => item !== '').shift() !== 'api') {
    console.log('ctx.request','html...')
    ctx.response.type = 'html';
    ctx.response.body = fs.readFileSync(path.join(__dirname, '..', 'client/dist/index.html'), 'utf8');
  } else {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CodePush-Plugin-Version, X-CodePush-Plugin-Name, X-CodePush-SDK-Version");
    ctx.set("Access-Control-Allow-Methods","PUT,POST,GET,PATCH,DELETE,OPTIONS");
    log.debug("use set Access-Control Header");
    return next();
  }
})

let middleware = koajwt({ secret: config.secret, debug: true }).unless({
    path: [
        '/api/user/register',
        '/api/user/login',
        '/api/user/resetPassword',
        '/api/swagger',
        '/api/swagger.json',
        /\/api\/v0.1\/public\/.+/,
        /\/api\/plist\/.+/,
        /\/api\/count\/.+/,
        /\/api\/app\/.+/
    ]
})

app.use(helper.skip(middleware).if((ctx) => {
    let key = ctx.request.headers['apikey']
    return !isUndefined(key)
}))

app.use(async(ctx, next) => {
    let key = ctx.request.headers['apikey']
    if (!isUndefined(key)) {
        let user = await Verify.auth(key).catch(error => {
            throw error
        })
        ctx.state.user = { data: user }
        await next()
    } else {
        await next()
    }
})

app.use(rest.restify())
app.use(router.routes())


//https

if (config.iosInstallUrl) {
    const https = require('https');
    const enforceHttps = require('koa-sslify').default;
    app.use(enforceHttps);
    const options = {
        key: fs.readFileSync('./ssl/server.key'),
        cert: fs.readFileSync('./ssl/server.crt')
    }
    https.createServer(options, app.callback()).listen(config.iosInstallPort);
}
AuthRouter.initAdminAccount().then(r => {
    // console.log('初始化用户完成...')
})
let appServer
if (config.host) {
    log.debug("start app host:",config.host);
    appServer = app.listen(config.port, config.host,() => {
        console.log(`App is listening on ${config.port}.`);
    });
}else {
    log.debug("start app port:",config.port);
    appServer  = app.listen(config.port,() => {
        console.log(`App is listening on ${config.port}.`);
    });
}
export default appServer;
