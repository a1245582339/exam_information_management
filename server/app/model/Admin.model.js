const Sequelize = require('sequelize')
const sequelize = require('../../config/sequelize.config')
const config = require('../../config')

const modelInfo = {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    login_name: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    role: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
    }
}

const modelConfig = {
    indexes: [
        {
          unique: true,
          fields: ['id']
        }
    ],
    timestamps: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true,
    freezeTableName: true,
    tableName: config.db_tables_prefix + 'admin',
}

module.exports = sequelize.define(config.db_tables_prefix + 'admin', modelInfo, modelConfig)