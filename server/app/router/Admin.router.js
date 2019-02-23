const Router = require('koa-better-router')
const router = new Router().loadMethods()
const AdminController = require('../controller/Admin.controller')

module.exports = router
    .put('/addAdmin', AdminController.addAdmin) //新增管理员
    .post('/adminLogin', AdminController.adminLogin) //登录
    .patch('/changeAdminPassword', AdminController.changeAdminPassword) //修改密码
    .get('/getAdminList/:limit/:page', AdminController.getAdminList) //获取管理员列表
    .delete('/delAdmin/:aid', AdminController.delAdmin)  //用户删除
    .patch('/editAdmin', AdminController.editAdmin) //编辑用户信息