const Router = require('koa-better-router')
const router = new Router().loadMethods()
const UserController = require('../controller/User.controller')

module.exports = router
    .put('/regUser', UserController.regUser) //注册新用户
    .del('/delUser/:uid', UserController.delUser) //删除用户
    .post('/userLogin', UserController.userLogin) //用户登录
    .get('/getUserInfo', UserController.getUserInfo) //获取用户信息
    .patch('/editUserInfo', UserController.editUserInfo) //编辑用户信息
    .patch('/editUserPassword', UserController.editUserPassword) //修改用户密码
    .get('/getUserList/:limit/:page', UserController.getUserList) //获取用户列表