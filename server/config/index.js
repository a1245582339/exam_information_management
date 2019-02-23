let config = {}

//环境信息
config.isDevelopment = process.env.NODE_ENV === 'development'
config.port = 9000 //端口信息

//请求配置
config.allowUrl = [] //允许跨域访问的地址
config.address = ['http://localhost:8080'] //允许跨域请求的域名

//日志配置
config.logName = 'web' //日志名
config.logPath = '' //日志目录
config.logFileName = '' //日志文件名

//加密信息
config.saltRounds = 10 //生成salt的迭代次数

//token认证
config.jwtSecret = 'webSite' //jwt密钥
config.logonValidPeriod = 10 //登录时长，单位小时
config.cookiesName = 'JsonWebToken' //储存的cookie名
config.cookiesDomain = ''
config.cookiesHttpOnly = false
config.unless = [/^\/*/] //不做token认证的目录，开发环境接受所有请求

//数据库配置
config.db_host = 'localhost'
config.db_port = 3306
config.db_username = 'root'
config.db_password = '1'
config.db_name = 'exam'
config.db_tables_prefix = 'exam_'

//系统其他配置
config.notificationTime = 0 //提前通知的时间，单位为小时

module.exports = config