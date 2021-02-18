// const axios = require('axios')
// const qs = require('qs')
// const { ad_url } = require('../../config')
//
// let token
// const getToken = async () => {
//   await axios({
//     method: 'post',
//     url: `${ad_url}/manager/manager/passport/login`,
//     data: qs.stringify({
//       username: 'yanwencheng',
//       password: '123456'
//     })
//   }).then(res => {
//     console.log('成功获取token')
//     token = res.data.data.token
//   }).catch((err) => {
//     console.log('获取token出错')
//   })
//   return token
// }
//
// // 创建axios实例
// // api的base_url process.env.BASE_API
// const service = axios.create({
//   baseURL: ad_url,
//   timeout: 300000 // 请求超时时间
// })
// //
// // // request拦截器
// service.interceptors.request.use(async config => {
//   config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
//   if (config.method === 'post') { // post请求时，处理数据
//     config.data = qs.stringify(config.data)
//   }
//   config.headers['Authorization'] = await getToken()// 配置token
//   return config
// }, error => {
//   console.log(error) // for debug
//   Promise.reject(error)
// })
// //
// // // respone拦截器
// service.interceptors.response.use(
//   response => {
//     const res = response.data
//     return res
//   }
// )
// module.exports = {
//   request: service
// }
