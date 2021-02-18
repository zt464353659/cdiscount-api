const { download } = require('./download')

module.exports = {
  getFileName: async function (ctx) {
    const body = ctx.request.body
    body.id = new Date().getTime()
    body.retry = 0
    if (!body.account) {
      ctx.body = {
        code: 405,
        msg: '请求缺少参数',
        data: []
      }
      return
    } else {
      ctx.body = {
        code: 200,
        msg: 'Start generating files',
        data: {
          id: body.id,
          file_name: `offres_${body.account}.xlsx`
        }
      }
      download(body)
    }
  }
}