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
    aid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    hash: {
        type: Sequelize.TEXT,
        allowNull: false
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
    tableName: config.db_tables_prefix + 'admin_hash',
}

module.exports = sequelize.define(config.db_tables_prefix + 'admin_hash', modelInfo, modelConfig)