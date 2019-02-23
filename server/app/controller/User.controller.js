const UserModel = require('../model/User.model')
const UserHashModel = require('../model/UserHash.model')
const UserInfoModel = require('../model/UserInfo.model')
const sequelize = require('../../config/sequelize.config')
const bcrypt = require('bcrypt')
const config = require('../../config')
const log = require('../../config/bunyan.config')
const jwt = require('jsonwebtoken')
const Op = require('sequelize').Op

// 注册用户
const regUser = async (ctx, next) => {

    // ctx.request.fields
    // { 
    //     name: '蛋蛋',
    //     login_name: 'dandan',
    //     password: '123456',
    // }

    // 检查用户名
    const checkUserExists = await UserModel.findOne({
        where: {
            login_name: ctx.request.fields.login_name
        }
    })
    if (checkUserExists) {
        ctx.state = {
            code: 102403,
            message: '已存在相同的用户名！'
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
    const addUserObj = Object.assign({}, ctx.request.fields)

    //进行插入新用户操作
    try {

        await sequelize.transaction(function (t) {
            return UserModel.create(addUserObj, {
                    transaction: t
                })
                .then(addUserRes => {
                    const userHashObj = {
                        uid: addUserRes.id,
                        hash: hashSaltRes
                    }
                    return UserHashModel.create(userHashObj, {
                        transaction: t
                    })
                })
                .then(userHashRes => {
                    return UserInfoModel.create({
                        uid: userHashRes.uid,
                        status: 0
                    }, {
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

// 删除用户
const delUser = async (ctx, next) => {

    // ctx.route.params
    // {
    //     uid:''
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
            return UserModel.destroy({
                    where: {
                        id: ctx.route.params.uid
                    }
                }, {
                    transaction: t
                })
                .then(() => {
                    return UserHashModel.destroy({
                        where: {
                            uid: ctx.route.params.uid
                        }
                    }, {
                        transaction: t
                    })
                })
                .then(() => UserInfoModel.destroy({
                    where: {
                        uid: ctx.route.params.uid
                    }
                }, {
                    transaction: t
                }))
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

//用户登录
const userLogin = async (ctx, next) => {

    // ctx.request.fields
    // {
    //     login_name: '',
    //     password: ''
    // }

    const userLoginObj = await UserModel.findOne({
        where: {
            login_name: ctx.request.fields.login_name
        }
    })
    //没找到用户，返回用户名密码错误，防止暴力破解时候猜测用户
    if (!userLoginObj) {
        ctx.state = {
            code: 100401,
            message: '用户名或密码错误！'
        }
        await next()
        return
    }

    const userHashObj = await UserHashModel.findOne({
        where: {
            uid: userLoginObj.dataValues.id
        }
    })

    //没找到密码，系统出错
    if (!userHashObj) {
        ctx.state = {
            code: 101500,
            message: '系统错误！'
        }
        await next()
        return
    }

    //校验密码
    const checkPass = await checkHashSalt(ctx.request.fields.password, userHashObj.dataValues.hash)

    //校验密码失败
    if (!checkPass) {
        ctx.state = {
            code: 100401,
            message: '用户名或密码错误！'
        }
        await next()
        return
    }

    // 这里去检查这个用户有没有通过实名认证
    const realNameAuthRes = await UserInfoModel.findOne({
        where: {
            uid: userLoginObj.id
        }
    })

    //校验密码成功，生成JsonWebToken
    const cookiesInfo = {
        id: userLoginObj.dataValues.id,
        role: 'common_user',
        realNameAuth: realNameAuthRes.status
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

//获取用户信息
const getUserInfo = async (ctx, next) => {

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

    const uid = jwtCookie.id

    //先检查有没有对应用户
    const checkUserExists = await UserModel.findOne({
        where: {
            id: uid
        }
    })
    if (!checkUserExists) {
        ctx.state = {
            code: 102403,
            message: '没有找到对应用户！'
        }
        await next()
        return
    }

    const getUserInfoRes = await UserInfoModel.findOne({
        where: {
            uid: uid
        },
        attributes: {
            exclude: ['id', 'created_at', 'updated_at', 'deleted_at']
        },
    })

    if (!getUserInfoRes) {
        ctx.state = {
            code: 102500,
            message: '系统错误！'
        }
        await next()
        return
    }

    ctx.state = {
        code: 100200,
        message: '用户信息获取成功！',
        data: {
            userInfo: getUserInfoRes
        }
    }
    await next()
    return

}

//编辑用户信息
const editUserInfo = async (ctx, next) => {

    // ctx.request.fields
    // {
    //     id: '',
    //     name: '',
    //     sex: '',
    //     tel: '',
    //     email: '',
    //     id_card: '',
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

    const editUserInfoRes = await UserInfoModel.update(ctx.request.fields, {
        where: {
            uid: ctx.request.fields.uid || jwtCookie.id
        }
    })

    if (!editUserInfoRes) {
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

//修改用户密码
const editUserPassword = async (ctx, next) => {

    // ctx.request.fields
    // {
    //     uid: 1,
    //     oldPassword: '123456'
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

    const userInfoRes = await UserHashModel.findOne({
        where: {
            uid: ctx.request.fields.uid
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

    // 如果不是管理员用户，需要验证原密码
    if (!(jwtCookie.role === 1 || jwtCookie.role === 2)) {
        const checkOldPasswordRes = await checkHashSalt(ctx.request.fields.oldPassword, userInfoRes.hash)
        if (!checkOldPasswordRes) {
            ctx.state = {
                code: 100403,
                message: '原密码不正确！'
            }
            await next()
            return
        }
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

    const changePasswordRes = await UserHashModel.update({
        hash: hashSaltRes
    }, {
        where: {
            uid: ctx.request.fields.uid
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

    if (jwtCookie.id == ctx.request.fields.uid) {
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

//获取用户列表
const getUserList = async (ctx, next) => {

    // ctx.route.params
    // {
    //     page:''
    //     limit:''
    // }

    const getUserListObj = {
        offset: (ctx.route.params.page - 1) * ctx.route.params.limit,
        limit: parseInt(ctx.route.params.limit),
        include: [{
            model: UserModel,
            as: 'UserInfo',
            attributes: ['login_name']
            // where: {
            //     login_name: {
            //         [Op.like]: `%${ctx.route.params.login_name || ''}%`
            //     }
            // }
        }],
        attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at']
        }
    }

    //获取总数，也就是在获取列表的限制上，获取count，同时不接受分页的参数
    const getUserCountAll = Object.assign({}, getUserListObj)
    delete getUserCountAll.offset
    delete getUserCountAll.limit

    try {
        const getUserListRes = await UserInfoModel.findAll(getUserListObj)
        const getUserCountAllRes = await UserInfoModel.count(getUserCountAll)

        ctx.state = {
            code: 100200,
            message: '用户列表获取成功！',
            data: {
                userList: getUserListRes,
                userCountTotal: getUserCountAllRes
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
    regUser,
    delUser,
    userLogin,
    getUserInfo,
    editUserInfo,
    editUserPassword,
    getUserList
}