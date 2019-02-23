const Router = require('koa-better-router')
const router = new Router().loadMethods()
const config = require('../../config')
const UserInfoModel = require('../model/UserInfo.model')
const jwt = require('jsonwebtoken')

module.exports = router
    //用户注销
    .post('/logout', async (ctx, next) => {
        ctx.cookies.set(config.cookiesName, '')
        ctx.state = {
            code: 101200,
            message: '注销成功！'
        }
        await next()
        return
    })
    //实名认证
    .post('/realNameAuth', async (ctx, next) => {

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

        try {
            await UserInfoModel.update({
                status: 1
            }, {
                where: {
                    uid: jwtCookie.id
                }
            })
        } catch (e) {
            console.log('实名认证出错 => ', e)
        }

        ctx.state = {
            code: 101200,
            message: '实名认证成功！'
        }
        await next()
        return
    })