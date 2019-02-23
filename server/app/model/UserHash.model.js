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
    uid: {
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
    tableName: config.db_tables_prefix + 'user_hash',
}

module.exports = sequelize.define(config.db_tables_prefix + 'user_hash', modelInfo, modelConfig)