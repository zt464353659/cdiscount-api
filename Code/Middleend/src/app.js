const koa = require('koa')
const koaBody = require('koa-body')
const cors = require('koa2-cors')
const koaStatic = require('koa-static')
const { router } = require('./router')
const path = require('path')
const { koaBodyConfig } = require('../config')
const app = new koa()

// 设置跨域
app.use(cors())
// post请求配置
app.use(koaBody(koaBodyConfig))
// 路由配置
app.use(router.routes())
app.use(router.allowedMethods())
// 设置静态目录
app.use(koaStatic(path.resolve('./downLoad')))

app.use(async(ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500
    ctx.response.body = {
      code: 0,
      message: err.msg,
      data: []
    }
    // 手动释放error事件
    ctx.app.emit('error', err, ctx)
  }
})

/*
 * 日志输出
 * */
app.use(async ctx => {
  console.log(`\r============================= Error log: =============================
              method  ==> ${ctx.request.method} 
              url  ==> ${ctx.request.url}
              msg  ==> ${JSON.stringify(ctx.request.body || ctx.query)}
              \r============================= Error end =============================`)
})
app.listen(3000, () => {
  console.log('server running in port 3000')
})
