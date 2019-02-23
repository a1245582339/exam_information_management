const Router = require('koa-better-router')
const router = new Router().loadMethods()
const SignInfoController = require('../controller/SignInfo.controller')

module.exports = router
    .put('/addSignInfo', SignInfoController.addSignInfo) //添加预约信息
    .delete('/cancleSignInfo/:eid/:uid', SignInfoController.cancleSignInfo) //取消预约信息
    .get('/getSignInfoList/:limit/:page', SignInfoController.getSignInfoList) //获取用户的预约列表
    // .get('/getExamSignUserList', SignInfoController.getExamSignUserList)  //获取某场考试的预约用户列表，测试接口，实际用于推送