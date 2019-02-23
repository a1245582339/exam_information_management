global.__base = __dirname + '/'
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const config = require('./config')
const koa = require('koa')
const app = new koa()
const jwtKoa = require('koa-jwt')
const router = require('./app/router')
const cors = require('koa2-cors')
const corsConfig = require('./config/cors.config')
const log = require('./config/bunyan.config')
const convert = require('koa-convert')
const bodyParser = require('koa-better-body')
const ResMid = require('./app/middleware/ResMid.middleware')
const sequelize = require('./config/sequelize.config')

if (cluster.isMaster) {

    // 数据库同步
    try {
        sequelize.sync()
        log.info(`数据库同步成功！`)
    } catch(err){
        log.error({errorName: err.name, stack: err.stack}, err.message)
    }

    log.info(`[master] listening: pid: ${process.pid}`)
    const useCpus = config.isDevelopment ? 1 : numCPUs
    for (var i = 0; i < useCpus; i++) {
        cluster.fork()
    }

    cluster.on('listening', (worker, address) => {
        log.info(`[worker] listening: worker ${worker.id}  pid: ${worker.process.pid} at port: ${address.port} env: ${process.env.NODE_ENV}`)
    })

} else if (cluster.isWorker) {
    app
        .use(convert(bodyParser({
            encoding: 'utf-8'
        })))
        .use(cors(corsConfig))
        .use(jwtKoa({
            secret: config.jwtSecret,
            cookie: config.cookiesName
        }).unless({
            path: config.isDevelopment ? [/^\/.*/] : config.unless
        }))
        .use(router.middleware())
        .use(ResMid)
        .listen(config.port || 9000)

    //捕获异常
    app
        .on('error', (err, ctx) => {
            if(!config.isDevelopment){
                log.error({errorName: err.name, stack: err.stack}, err.message)
            }
        })
}

