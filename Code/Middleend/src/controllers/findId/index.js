const { findId } = require('./find_id')

module.exports = {
  findId: async function (ctx) {
    const body = ctx.request.body
    if (!body.account || !body.package_name) {
      ctx.body = {
        code: 405,
        msg: '请求缺少参数',
        data: []
      }
      return
    }
    ctx.body = await findId(body)
  }
}