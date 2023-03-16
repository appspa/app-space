'use strict';
const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
import config from '../config';
const _ = require('lodash');
const factory = {};
module.exports = factory;

factory.getRedisClient = function (name) {
  return redis.createClient(_.get(config, `redis.${name}`));
};
