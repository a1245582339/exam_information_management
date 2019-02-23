//统一处理API返回内容
module.exports = (ctx, next) => {
    ctx.response.status = ctx.state['code'] ? ctx.state['code'] % 1000 : 500,
    ctx.body = {
        code: ctx.state.code || 500,
        message: ctx.state.message || '系统错误！',
        url: ctx.request.url,
        data: ctx.state.data || {}, 
        // redirect: ctx.state.redirect || ''
    }
    return
}