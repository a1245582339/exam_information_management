const SignInfoModel = require('../model/SignInfo.model')
const ExamInfoModel = require('../model/ExamInfo.model')
const UserInfoModel = require('../model/UserInfo.model')
const ExamCategoryModel = require('../model/ExamCategory.model')
const log = require('../../config/bunyan.config')
const config = require('../../config')
const jwt = require('jsonwebtoken')

// 添加预约信息
const addSignInfo = async (ctx, next) => {

    // ctx.request.fields
    // { 
    //    eid
    // }

    const cookiesObj = ctx.cookies.get(config.cookiesName)

    if (!cookiesObj) {
        ctx.state = {
            code: 100403,
            message: '请先登录后再进行操作！'
        }
        await next()
        return
    }

    const jwtCookie = jwt.verify(cookiesObj, config.jwtSecret)

    ctx.request.fields.uid = jwtCookie.id

    const checkSignInfoExist = await SignInfoModel.findOne({
        where: ctx.request.fields
    })

    if (checkSignInfoExist) {
        ctx.state = {
            code: 106403,
            message: '您已经预约过本场考试的提醒了！'
        }
        await next()
        return
    }

    const addSignInfoRes = await SignInfoModel.create(ctx.request.fields)

    if (!addSignInfoRes) {
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

//取消预约信息
const cancleSignInfo = async (ctx, next) => {

    // ctx.route.params
    // {
    //     uid: ''
    //     eid: ''
    // }

    const cookiesObj = ctx.cookies.get(config.cookiesName)

    if (!cookiesObj) {
        ctx.state = {
            code: 100403,
            message: '请先登录后再进行操作！'
        }
        await next()
        return
    }

    try {
        await SignInfoModel.destroy({
            where: ctx.route.params
        })

        ctx.state = {
            code: 100200,
            message: '删除成功！',
        }

        next()
        return

    } catch (err) {
        log.error({
            errorName: err.name,
            stack: err.stack
        }, err.message)
        ctx.state = {
            code: 104500,
            message: '系统错误！'
        }
        next()
        return
    }
}

//获取某个用户的预约列表
const getSignInfoList = async (ctx, next) => {
    // ctx.route.params
    // {
    //     page:''
    //     limit:''
    // }

    const cookiesObj = ctx.cookies.get(config.cookiesName)

    if (!cookiesObj) {
        ctx.state = {
            code: 100403,
            message: '请先登录后再进行操作！'
        }
        await next()
        return
    }

    const jwtCookie = jwt.verify(cookiesObj, config.jwtSecret)

    const getSignInfoListObj = {
        offset: (ctx.route.params.page - 1) * ctx.route.params.limit,
        limit: parseInt(ctx.route.params.limit),
        include: [{
            model: ExamInfoModel,
            as: 'ExamInfo',
            attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at']
            },
            include: [{
                model: ExamCategoryModel,
                as: 'ExamCategoryInfo',
                attributes: ['name']
            }]
        }],
        attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
        },
        where: {
            uid: jwtCookie.id
        },
    }

    //获取总数，也就是在获取列表的限制上，获取count，同时不接受分页的参数
    const getSignInfoCountAll = Object.assign({}, getSignInfoListObj)
    delete getSignInfoCountAll.offset
    delete getSignInfoCountAll.limit

    try {

        const getSignInfoListRes = await SignInfoModel.findAll(getSignInfoListObj)
        const getSignInfoListCountAllRes = await SignInfoModel.count(getSignInfoCountAll)

        ctx.state = {
            code: 100200,
            message: '获取考试信息列表成功！',
            data: {
                SignInfoList: getSignInfoListRes,
                SignInfoListCountTotal: getSignInfoListCountAllRes
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

//获取某场考试的预约用户列表
const getExamSignUserList = async (eid) => {

    const getSignInfoListObj = {
        include: [{
            model: UserInfoModel,
            as: 'UserInfo',
            attributes: {
                exclude: ['created_at', 'updated_at', 'deleted_at']
            }
        }],
        attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
        },
        where: {
            eid
        },
    }

    let getUserList = await SignInfoModel.findAll(getSignInfoListObj)
    getUserList = getUserList.map(item => {
        return {
            id: item.UserInfo.uid,
            name: item.UserInfo.name,
            tel: item.UserInfo.tel,
            email: item.UserInfo.email
        }
    })

    try{
        const sendRes = await Promise.all(getUserList.map(item => {
            return new Promise((resolve, reject) => {
                const sendRes = sendMailAndSms(item)
                resolve(sendRes)
                // reject('error')
            })
        }))

        console.log('推送结果 => ', JSON.parse(JSON.stringify(sendRes)))
        console.log(`推送成功，推送给了${JSON.parse(JSON.stringify(sendRes)).length}个人`)

    } catch (err) {
        console.log('error => ',  err)
    }

}

//发送邮件和短信
const sendMailAndSms = async userInfoObj => userInfoObj

module.exports = {
    addSignInfo,
    cancleSignInfo,
    getSignInfoList,
    getExamSignUserList
}