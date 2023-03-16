import _path from 'path';
import _ from 'lodash';
import validate from './validate';
import { swaggerHTML } from './swaggerHTML';
import init from './swaggerTemplate';
import { apiObjects } from './index';
/**
 * allowed http methods
 */
const reqMethods = ['get', 'post', 'put', 'patch', 'delete'];

/**
 * eg. /api/{id} -> /api/:id
 * @param {String} path
 */
const convertPath = (path) => {
  const re = new RegExp('{(.*?)}', 'g');
  return path.replace(re, ':$1');
};

/**
 * middlewara for validating [query, path, body] params
 * @param {Object} parameters
 */
const validator = parameters => async (ctx, next) => {
  if (!parameters) {
    await next();
    return;
  }

  if (parameters.query) {
    ctx.validatedQuery = validate(ctx.request.query, parameters.query);
  }
  if (parameters.path) {
    ctx.validatedParams = validate(ctx.params, parameters.path);
  }
  if (parameters.body) {
    ctx.validatedBody = validate(ctx.request.body, parameters.body);
  }
  await next();
};

const getPath = (prefix, path) => `${prefix}${path}`.replace('//', '/');
/**
 * 构建swagger的json
 */
const buildSwaggerJson = (options = {}, apiObjects) => {
  const {
    title,
    description,
    version,
    prefix = '',
    swaggerOptions = {},
  } = options;
  const swaggerJSON = init(title, description, version, swaggerOptions);

  _.chain(apiObjects)
    .forEach((value) => {
      if (!Object.keys(value).includes('request')) { throw new Error('missing [request] field'); }

      const { method } = value.request;
      let { path } = value.request;
      path = getPath(prefix, path); // 根据前缀补全path
      const summary = value.summary
        ? value.summary
        : '';
      const description = value.description
        ? value.description
        : summary;
      const responses = value.responses
        ? value.responses
        : {
          200: {
            description: 'success'
          }
        };
      const {
        query = [],
        path: pathParams = [],
        body = [],
        tags,
        formData = [],
        security,
      } = value;

      const parameters = [
        ...pathParams,
        ...query,
        ...formData,
        ...body,
      ];

      // init path object first
      if (!swaggerJSON.paths[path]) { swaggerJSON.paths[path] = {}; }

      // add content type [multipart/form-data] to support file upload
      const consumes = formData.length > 0
        ? ['multipart/form-data']
        : undefined;

      swaggerJSON.paths[path][method] = {
        consumes,
        summary,
        description,
        parameters,
        responses,
        tags,
        security
      };
    }).value();
  return swaggerJSON;
};

/**
 * add [ router.map ] and [ router.swagger ] for router object
 * @param {Object} router
 */
export default (router) => {
  router.swagger = (options) => {
    const {
      swaggerJsonEndpoint = '/swagger-json',
      swaggerHtmlEndpoint = '/swagger-html',
      prefix = '',
    } = options;

    // setup swagger router
    router.get(swaggerJsonEndpoint, async (ctx) => {
      ctx.body = buildSwaggerJson(options, apiObjects);
    });
    router.get(swaggerHtmlEndpoint, async (ctx) => {
      ctx.body = swaggerHTML(getPath(prefix, swaggerJsonEndpoint));
    });
  };
  router.map = (StaticClass) => {
    const methods = Object.getOwnPropertyNames(StaticClass);

    // remove useless field in class object:  constructor, length, name, prototype
    _.pull(methods, 'name', 'constructor', 'length', 'prototype');

    // map all method in methods
    methods
    // filter methods withour @request decorator
      .filter((item) => {
        const { path, method } = StaticClass[item];
        if (!path && !method) { return false; }
        return true;
      })
    // add router
      .forEach((item) => {
        const { path, method } = StaticClass[item];
        let {
          middlewares = []
        } = StaticClass[item];
        if (typeof middlewares === 'function') { middlewares = [middlewares]; }
        if (!Array.isArray(middlewares)) { throw new Error('middlewares params must be an array or function'); }
        middlewares.forEach((item) => {
          if (typeof item !== 'function') { throw new Error('item in middlewares must be a function'); }
        });
        if (!reqMethods.includes(method)) { throw new Error(`illegal API: ${method} ${path} at [${item}]`); }
        const chain = [
          `${convertPath(path)}`,
          validator(StaticClass[item].parameters),
          ...middlewares,
          StaticClass[item]
        ];
        router[method](...chain);
      });
  };
};


export { convertPath, getPath };
