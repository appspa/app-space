// var jsonwebtoken = require("jsonwebtoken")

module.exports = {
    APIError: function(code, message) {
        this.code = code || 'internal:unknown_error'
        this.message = message || ''
    },
    restify: (pathPrefix) => {
        pathPrefix = pathPrefix || '/api/'
        return async(ctx, next) => {

            if (ctx.request.path.startsWith(pathPrefix)) {
                console.log(`Process API ${ctx.request.method} ${ctx.request.url}...`)
                ctx.rest = (data) => {
                    ctx.response.type = 'application/json'
                    ctx.response.body = data
                }
                try {
                    await next()
                } catch (e) {
                    console.log('Process API error...')
                    ctx.response.type = 'application/json'
                    ctx.response.body = {
                        success: false,
                        message: e.message || ''
                    }
                    console.log(e)
                }
            } else {
                await next()
            }
        }
    }
}
