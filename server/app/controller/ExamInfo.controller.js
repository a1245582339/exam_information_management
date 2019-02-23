const ExamInfoModel = require('../model/ExamInfo.model')
const ExamCategoryModel = require('../model/ExamCategory.model')
const log = require('../../config/bunyan.config')
const schedule = require('node-schedule')
const SignInfoController = require('../controller/SignInfo.controller')
const config = require('../../config')

//添加考试信息
const addExamInfo = async (ctx, next) => {

    // ctx.request.fields
    // { 
    // time
    // title
    // author
    // url
    // content
    // cid
    // }

    const addExamInfo = await ExamInfoModel.create(ctx.request.fields)

    if (!addExamInfo) {
        ctx.state = {
            code: 106500,
            message: '系统错误！'
        }
        await next()
        return
    }

    const notificationDateTime = (new Date(ctx.request.fields.time)).getTime() - (config.notificationTime ? config.notificationTime * 3600000 : 0);

    schedule.scheduleJob(String(addExamInfo.id), notificationDateTime, () => {
        // 这里去查询预约的用户，并推送
        SignInfoController.getExamSignUserList(addExamInfo.id)
    })

    ctx.state = {
        code: 100200,
        message: '添加成功！'
    }
    await next()
    return
}

//删除考试信息
const delExamInfo = async (ctx, next) => {
    try {
        await ExamInfoModel.destroy({
            where: {
                id: ctx.route.params.id
            }
        })

        //删除预约的信息
        schedule.scheduledJobs[`${String(ctx.route.params.id)}`].cancel()

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

//获取考试信息列表
const getExamInfoList = async (ctx, next) => {
    // ctx.route.params
    // {
    //     page:''
    //     limit:''
    // }

    const getExamInfoListObj = {
        offset: (ctx.route.params.page - 1) * ctx.route.params.limit,
        limit: parseInt(ctx.route.params.limit),
        include: [{
            model: ExamCategoryModel,
            as: 'ExamCategoryInfo',
            attributes: ['name']
        }],
        attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
        }
    }

    //获取总数，也就是在获取列表的限制上，获取count，同时不接受分页的参数
    const getAdminCountAll = Object.assign({}, getExamInfoListObj)
    delete getAdminCountAll.offset
    delete getAdminCountAll.limit

    try {
        const getExamInfoListRes = await ExamInfoModel.findAll(getExamInfoListObj)
        const getExamInfoCountAllRes = await ExamInfoModel.count(getAdminCountAll)

        ctx.state = {
            code: 100200,
            message: '获取考试信息列表成功！',
            data: {
                examInfoList: getExamInfoListRes,
                examInfoCountTotal: getExamInfoCountAllRes
            }
        }

        next()
        return
    } catch (err) {
        // log.error({
        //     errorName: err.name,
        //     stack: err.stack
        // }, err.message)
        console.log(err)
        ctx.state = {
            code: 103500,
            message: '系统错误！'
        }
        next()
        return
    }
}

module.exports = {
    addExamInfo,
    delExamInfo,
    getExamInfoList
}