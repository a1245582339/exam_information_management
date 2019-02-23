const AdminModel = require('../model/Admin.model')
const AdminHashModel = require('../model/AdminHash.model')
const sequelize = require('../../config/sequelize.config')
const bcrypt = require('bcrypt-nodejs')
const config = require('../../config')
const log = require('../../config/bunyan.config')
const jwt = require('jsonwebtoken')

//新增用户
const addAdmin = async (ctx, next) => {

    // ctx.request.fields
    // { 
    //     name: '蛋蛋',
    //     login_name: 'dandan',
    //     password: '123456',
    // }

    //检查用户名
    const checkAdminExists = await AdminModel.findOne({
        where: {
            login_name: ctx.request.fields.login_name
        }
    })
    if (checkAdminExists) {
        ctx.state = {
            code: 102403,
            message: '已存在相同的登录名！'
        }
        await next()
        return
    }

    //生成密码
    const hashSaltRes = await newHashSalt(ctx.request.fields.password)
    if (!hashSaltRes) {
        ctx.state = {
            code: 100500,
            message: '系统错误！'
        }
        await next()
        return
    }

    //这里开始删除原密码
    delete ctx.request.fields.password
    const addAdminObj = Object.assign({}, ctx.request.fields)

    //进行插入新管理员操作
    try {

        await sequelize.transaction(function (t) {
            return AdminModel.create(addAdminObj, {
                    transaction: t
                })
                .then(addAdminRes => {
                    const adminHashObj = {
                        aid: addAdminRes.id,
                        hash: hashSaltRes
                    }
                    return AdminHashModel.create(adminHashObj, {
                        transaction: t
                    })
                })
        })

        ctx.state = {
            code: 100200,
            message: '添加成功！'
        }
        await next()

    } catch (e) {
        ctx.state = {
            code: 101500,
            message: '系统错误！'
        }
        await next()
    }
    return
}

//用户登录
const adminLogin = async (ctx, next) => {

    // ctx.request.fields
    // {
    //     login_name: '',
    //     password: ''
    // }

    const adminLoginObj = await AdminModel.findOne({
        where: {
            login_name: ctx.request.fields.login_name
        }
    })
    //没找到用户，返回用户名密码错误，防止暴力破解时候猜测用户
    if (!adminLoginObj) {
        ctx.state = {
            code: 100401,
            message: '用户名或密码错误！'
        }
        await next()
        return
    }

    const adminHashObj = await AdminHashModel.findOne({
        where: {
            aid: adminLoginObj.dataValues.id
        }
    })

    //没找到密码，系统出错
    if (!adminHashObj) {
        ctx.state = {
            code: 101500,
            message: '系统错误！'
        }
        await next()
        return
    }

    //校验密码
    const checkPass = await checkHashSalt(ctx.request.fields.password, adminHashObj.dataValues.hash)

    //校验密码失败
    if (!checkPass) {
        ctx.state = {
            code: 100401,
            message: '用户名或密码错误！'
        }
        await next()
        return
    }

    //校验密码成功，生成JsonWebToken
    const cookiesInfo = {
        id: adminLoginObj.dataValues.id,
        name: adminLoginObj.dataValues.name,
        role: adminLoginObj.dataValues.role
    }
    const JsonWebToken = jwt.sign(
        cookiesInfo,
        config.jwtSecret, {
            expiresIn: 60 * 60 * config.logonValidPeriod
        }
    )
    //设置JsonWebToken有效期和工作目录
    const JsonWebTokenConfig = {
        domain: config.cookiesDomain,
        maxAge: 1000 * 60 * 60 * config.logonValidPeriod,
        // path: '/',
        httpOnly: config.cookiesHttpOnly,
    }

    //设置cookies
    try {
        ctx.cookies.set(config.cookiesName, JsonWebToken, JsonWebTokenConfig)
    } catch (err) {
        log.error({
            errorName: err.name,
            stack: err.stack
        }, err.message)
        ctx.state = {
            code: 102500,
            message: '系统内部错误！'
        }
        await next()
    }

    //登录成功
    ctx.state = {
        code: 101200,
        message: '登录成功！',
        data: {
            token: JsonWebToken
        }
    }
    await next()

}

//修改密码
const changeAdminPassword = async (ctx, next) => {

    // ctx.request.fields
    // {
    //     aid: 1 
    //     password: '123456'
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

    const userInfoRes = await AdminModel.findOne({
        where: {
            id: ctx.request.fields.aid
        }
    })

    if (!userInfoRes) {
        ctx.state = {
            code: 100404,
            message: '找不到要修改密码的用户！'
        }
        await next()
        return
    }

    //生成hash
    const hashSaltRes = await newHashSalt(ctx.request.fields.password)
    if (!hashSaltRes) {
        ctx.state = {
            code: 100500,
            message: '系统错误！'
        }
        await next()
        return
    }

    const changePasswordRes = await AdminHashModel.update({
        hash: hashSaltRes
    }, {
        where: {
            aid: ctx.request.fields.aid
        }
    })

    if (!changePasswordRes) {
        ctx.state = {
            code: 101500,
            message: '系统错误！'
        }
        await next()
        return
    }

    if (jwtCookie.id == ctx.request.fields.aid) {
        ctx.cookies.set(config.cookiesName, '', {
            signed: false,
            maxAge: 0
        })
    }

    ctx.state = {
        code: 100200,
        message: '密码修改成功！'
    }
    await next()
    return

}

//获取管理员列表
const getAdminList = async (ctx, next) => {
    
    // ctx.route.params
    // {
    //     page:''
    //     limit:''
    // }

    const getAdminListObj = {
        offset: (ctx.route.params.page - 1) * ctx.route.params.limit,
        limit: parseInt(ctx.route.params.limit),
        attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
        }
    }

    //获取总数，也就是在获取列表的限制上，获取count，同时不接受分页的参数
    const getAdminCountAll = Object.assign({}, getAdminListObj)
    delete getAdminCountAll.offset
    delete getAdminCountAll.limit

    try {
        const getAdminListRes = await AdminModel.findAll(getAdminListObj)
        const getAdminCountAllRes = await AdminModel.count(getAdminListObj)

        ctx.state = {
            code: 100200,
            message: '管理员列表获取成功！',
            data: {
                adminList: getAdminListRes,
                adminCountTotal: getAdminCountAllRes
            }
        }

        next()
        return
    } catch (err) {
        log.error({
            errorName: err.name,
            stack: err.stack
        }, err.message)
        ctx.state = {
            code: 103500,
            message: '系统错误！'
        }
        next()
        return
    }

}

//删除管理员用户
const delAdmin = async (ctx, next) => {

    // ctx.route.params
    // {
    //     aid:''
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
        await sequelize.transaction(function (t) {
            return AdminModel.destroy({
                    where: {
                        id: ctx.route.params.aid
                    }
                }, {
                    transaction: t
                })
                .then(() => {
                    return AdminHashModel.destroy({
                        where: {
                            aid: ctx.route.params.aid
                        }
                    }, {
                        transaction: t
                    })
                })
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

//编辑管理员信息
const editAdmin = async (ctx, next) => {

    // ctx.request.fields
    // {
    //     id: 1,
    //     login_name: 'admin1'
    //     name: 'Helen'
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

    const adminInfoRes = await AdminModel.findOne({
        where: {
            login_name: ctx.request.fields.login_name
        }
    })
    if (adminInfoRes && adminInfoRes.id !== ctx.request.fields.id) {
        ctx.state = {
            code: 101403,
            message: '存在相同的用户名！'
        }
        await next()
        return
    }

    const editAdminRes = await AdminModel.update({
        name: ctx.request.fields.name
    }, {
        where: {
            id: ctx.request.fields.id
        }
    })

    if (!editAdminRes) {
        log.error({
            errorName: err.name,
            stack: err.stack
        }, err.message)
        ctx.state = {
            code: 105500,
            message: '系统错误！'
        }
        next()
        return
    }

    ctx.state = {
        code: 100200,
        message: '编辑成功！'
    }
    await next()
    return
}


/**
 * 新增用户，生成hash和salt
 */
const newHashSalt = async (password) => {
    return await new Promise(async (resolve, reject) => {
        try {
            let salt = await genSalt()
            let hash = await getHash(password, salt)
            resolve(hash)
        } catch (err) {
            log.error({
                errorName: err.name,
                stack: err.stack
            }, err.message)
            reject(false)
        }
    })
}

/**
 * 生成salt
 */
const genSalt = async () => {
    const saltRounds = config.saltRounds //生成salt的迭代次数
    return await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                reject(err)
            }
            resolve(salt)
        })
    })
}

/**
 * 生成hash
 * @param {待加密的密码} password 
 * @param {salt值} salt 
 */
const getHash = async (password, salt) => {
    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                reject(err)
            }
            resolve(hash)
        })
    })
}

/**
 * 检验用户信息
 */
const checkHashSalt = async (password, password_hash) => {
    return await new Promise(async (resolve, reject) => {
        bcrypt.compare(password, password_hash, (err, res) => {
            if (err) {
                reject(err)
            }
            resolve(res)
        })
    })
}

module.exports = {
    addAdmin,
    adminLogin,
    changeAdminPassword,
    getAdminList,
    delAdmin,
    editAdmin
}