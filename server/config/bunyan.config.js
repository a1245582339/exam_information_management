const bunyan = require('bunyan')
const path = require('path')
const config = require('./index')

const buyanConfig = {
	name: config.logName || 'webLog',
	streams: [
		{
            name: config.logName || 'webLog-debug',
			level: 'trace',
			stream: process.stdout
        },
		{
			name: config.logName || 'webLog-log',
			level: 'info',
			path: (config.logPath + config.logFileName) || path.join(__base , 'logs', config.logFileName || (config.logName || 'webLog-log') + '.log')
		}
	]
}

module.exports = bunyan.createLogger(buyanConfig)