const Sequelize = require('sequelize')
const sequelize = require('../../config/sequelize.config')
const config = require('../../config')
const ExamCategoryModel = require('./ExamCategory.model')

const modelInfo = {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING(225),
        allowNull: false,
    },
    author: {
        type: Sequelize.STRING(225),
        allowNull: false
    },
    url: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    cid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false
    }
}

const modelConfig = {
    indexes: [{
        unique: true,
        fields: ['id']
    }],
    timestamps: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true,
    freezeTableName: true,
    tableName: config.db_tables_prefix + 'exam_info',
}

let ExamInfoModel = sequelize.define(config.db_tables_prefix + 'exam_info', modelInfo, modelConfig)
ExamInfoModel.belongsTo(ExamCategoryModel, {
    foreignKey: 'cid',
    as: 'ExamCategoryInfo'
})

module.exports = ExamInfoModel