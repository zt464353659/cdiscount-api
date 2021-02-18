const { login } = require('./login')

module.exports = {
  updateFile: async function (ctx) {
    const body = ctx.request.body
    let fileName = ctx.request.files.filepath.name
    fileName = fileName.split('/')[fileName.split('/').length - 1]
    body.file_name = fileName
    body.retry = 0
    if (!body.file_name) {
      ctx.body = {
        code: 405,
        msg: '请求缺少参数',
        data: []
      }
    } else {
      ctx.body = {
        code: 200,
        msg: 'Start upload file',
        data:[]
      }
      login(body)
    }
  }
}