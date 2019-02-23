const Sequelize = require('sequelize')
const sequelize = require('../../config/sequelize.config')
const config = require('../../config')
const UserModel = require('../model/User.model')

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
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    sex: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    tel: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    id_card: {
        type: Sequelize.STRING,
        allowNull: true
    },
    status: {
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
    tableName: config.db_tables_prefix + 'user_info',
}

let userInfoModal = sequelize.define(config.db_tables_prefix + 'user_info', modelInfo, modelConfig)
userInfoModal.belongsTo(UserModel, {
    foreignKey: 'uid',
    as: 'UserInfo'
})

module.exports = userInfoModal