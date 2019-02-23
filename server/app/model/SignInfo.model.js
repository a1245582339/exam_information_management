const Sequelize = require('sequelize')
const sequelize = require('../../config/sequelize.config')
const config = require('../../config')
const ExamInfoModel = require('../model/ExamInfo.model')
const UserInfoModel = require('../model/UserInfo.model')

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
    eid: {
        type: Sequelize.INTEGER,
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
    tableName: config.db_tables_prefix + 'sign_info',
}

let signInfoModel = sequelize.define(config.db_tables_prefix + 'sign_info', modelInfo, modelConfig)
signInfoModel.belongsTo(ExamInfoModel, { foreignKey: 'eid', as: 'ExamInfo' });
signInfoModel.belongsTo(UserInfoModel, { foreignKey: 'uid', targetKey: 'uid', as: 'UserInfo' })

module.exports = signInfoModel
                    