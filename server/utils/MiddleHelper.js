import compose from 'koa-compose'

export default class MiddleHelper {

    skip(...middle) {
        return Object.create(Object.prototype, {
            'if': {
                value: function(fn) {
                    return function(ctx, next) {
                        return fn(ctx) ? next() : compose(middle)(ctx, next)
                    }
                }
            },
            'unless': {
                value: function(fn) {
                    return function(ctx, next) {
                        return fn(ctx) ? compose(middle)(ctx, next) : next()
                    }
                }
            }
        })
    }

}