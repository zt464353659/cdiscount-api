const fs = require('fs')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const { mongo } = require('../../config')
const XLSX = require('xlsx')
const path = require('path')

// 保存文件到数据库
const saveFile = (fileName, filePath, id) => {
  return new Promise((resolve, reject) => {

    const data = fs.readFileSync(filePath)
    const workbook = XLSX.read(data, {
      type: 'buffer'
    })
    const xlsx_data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
    const ws = XLSX.utils.json_to_sheet(xlsx_data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws)
    XLSX.writeFile(wb, filePath)

    const Schema = mongoose.Schema
    mongoose.connect(`mongodb://${mongo.username}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.database}`, { useNewUrlParser: true })
    const conn = mongoose.connection
    Grid.mongo = mongoose.mongo

    conn.once('open', function () {
      console.log('dataBase connect')
      const gfs = Grid(conn.db)

      // 写文件
      const writestream = gfs.createWriteStream({
        filename: fileName,
        root: 'sfc_file_cdiscount',
        _id: id.toString()
      })
      fs.createReadStream(filePath).pipe(writestream)

      writestream.on('close', function (file) {
        console.log(file.filename + ' Written To DB')
        resolve(file)
      })
      writestream.on('error', function (err) {
        reject(err)
      })
    })
  })
}
module.exports = saveFile