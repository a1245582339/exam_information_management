const ExamCategoryModel = require('../model/ExamCategory.model')
const Op = require('sequelize').Op
const log = require('../../config/bunyan.config')

//添加考试分类
const addExamCategory = async (ctx, next) => {

    // ctx.request.fields
    // { 
    //     name: '蛋蛋',
    //     parent_id: 0
    // }

    const checkExamCategoryExists = await ExamCategoryModel.findOne({
        where: ctx.request.fields
    })

    if (checkExamCategoryExists) {
        ctx.state = {
            code: 103403,
            message: '已存在相同的分类名！'
        }
        await next()
        return
    }

    const addExamCategoryRes = await ExamCategoryModel.create(ctx.request.fields)

    if (!addExamCategoryRes) {
        ctx.state = {
            code: 106500,
            message: '系统错误！'
        }
        await next()
        return
    }

    ctx.state = {
        code: 100200,
        message: '添加成功！'
    }
    await next()
    return

}

//删除考试分类
const delExamCategory = async (ctx, next) => {

    try {
        await ExamCategoryModel.destroy({
            where: {
                [Op.or]: [{
                    id: ctx.route.params.id
                }, {
                    parent_id: ctx.route.params.id
                }]
            }
        })

        ctx.state = {
            code: 100200,
            message: '删除成功！'
        }
        await next()
        return

    } catch (err) {

        log.error({
            errorName: err.name,
            stack: err.stack
        }, err.message)
        ctx.state = {
            code: 107500,
            message: '系统错误！'
        }
        await next()
        return

    }

}

//获取考试分类
const getExamCategoryList = async (ctx, next) => {
    try {
        const ExamCategoryTopList = await ExamCategoryModel.findAll({
            attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at']
            }
        })

        ctx.state = {
            code: 100200,
            message: '获取成功！',
            data: {
                ExamCategoryTopList
            }
        }
        await next()
        return

    } catch (err) {

        log.error({
            errorName: err.name,
            stack: err.stack
        }, err.message)
        ctx.state = {
            code: 107500,
            message: '系统错误！'
        }
        await next()
        return
    }
}

module.exports = {
    addExamCategory,
    delExamCategory,
    getExamCategoryList
}