const Router = require('koa-better-router')
const router = new Router().loadMethods()
const ExamController = require('../controller/Exam.controller')
const ExamInfoController = require('../controller/ExamInfo.controller')

module.exports = router
    .put('/addExamCategory', ExamController.addExamCategory) //添加考试分类
    .del('/delExamCategory/:id', ExamController.delExamCategory) //删除考试分类
    .get('/getExamCategoryList', ExamController.getExamCategoryList) //获取考试分类列表
    .put('/addExamInfo', ExamInfoController.addExamInfo) //添加考试信息
    .del('delExamInfo/:id', ExamInfoController.delExamInfo)  //删除考试分类
    .get('/getExamInfoList/:limit/:page', ExamInfoController.getExamInfoList) //获取考试分类列表