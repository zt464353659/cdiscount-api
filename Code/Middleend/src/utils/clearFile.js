// const fs = require('fs')
// const path = require('path')
//
// module.exports = {
//   clearFile: (fileName) => {
//     //每月清理一次downLoad文件夹
//     const files = fs.readdirSync(path.join(process.cwd() + fileName), { encoding: 'utf8' })
//     const year = new Date().getFullYear()
//     const month = new Date().getMonth() + 1
//
//     if (files.length) {
//       // 防止下标乱序
//       const originFiles = JSON.parse(JSON.stringify(files))
//       originFiles.map(item => {
//         // 文件命名格式为年月日开头，根据日期判断删除除当月之外的文件
//         if (item.slice(0, 4) < year || item.slice(4, 6) < month) {
//           fs.unlinkSync(path.join(process.cwd() + fileName +'/') + item)
//         }
//       })
//     }
//   }
// }