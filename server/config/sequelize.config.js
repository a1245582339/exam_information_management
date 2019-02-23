const config = require('./index')
const Sequelize = require('sequelize')

module.exports = new Sequelize(
    config.db_name,
    config.db_username, 
    config.db_password, 
    {
        host: config.db_host,
        dialect: 'mysql',
        port: config.db_port,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        operatorsAliases: false,
        timezone: "+08:00"
    },
)