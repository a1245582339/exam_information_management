const config = require('./index')

module.exports = {
    origin: (ctx) => {
        if (config.allowUrl.indexOf(ctx.request.url) >= 0) {
            return '*'
        }
        if (config.address.indexOf(ctx.request.header.origin) >= 0) {
            return ctx.request.header.origin
        }
        return false
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 3600 * 24,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}