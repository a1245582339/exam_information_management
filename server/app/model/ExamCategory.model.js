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
    name: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    parent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    tableName: config.db_tables_prefix + 'exam_category',
}

module.exports = sequelize.define(config.db_tables_prefix + 'exam_category', modelInfo, modelConfig)