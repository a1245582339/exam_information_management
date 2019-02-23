const Router = require('koa-better-router')
const router = new Router().loadMethods()

const CommonRouter = require('./Common.router') //公共路由
const AdminRouter = require('./Admin.router') //管理员
const ExamRouter = require('./Exam.router') //考试信息
const UserRouter = require('./User.router') //用户路由
const SignInfoRouter = require('./SignInfo.route') //用户登记

router.extend(CommonRouter)
router.extend(AdminRouter)
router.extend(ExamRouter)
router.extend(UserRouter)
router.extend(SignInfoRouter)

module.exports = router