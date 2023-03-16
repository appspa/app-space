import Router from 'koa-router';
import fs from 'fs';
import swagger from './swagger';

const router = new Router();
swagger.wrapper(router);

// 添加swagger的路由
router.swagger({
  title: 'App Space Server', description: 'API DOC', version: '1.0.0',
  // [optional] default is root path. prefix : '/api', [optional] default is
  // /swagger-html
  swaggerHtmlEndpoint: '/api/swagger',
  // [optional] default is /swagger-json
  swaggerJsonEndpoint: '/api/swagger.json',

  // [optional] additional options for building swagger doc eg. add api_key as
  // shown below
  swaggerOptions: {
    securityDefinitions: {
      ApiKeyAuth: {
        type: 'apiKey', in: 'header',
        name: 'Authorization'
      }
    }
  }
});

(function () {
  let files = fs.readdirSync('./controllers')
  let js_files = files.filter((f) => {
    return f.endsWith('.js')
  })

  for (let f of js_files) {
    console.log(`process controller: ${f}...`)
    let mapping = require('./controllers/' + f)
    console.log(mapping)
    router.map(mapping)
  }
})();


// router.get('/', async (ctx, next) => {
//   ctx.redirect("/index.html")
// });

export default router
