const path = require('path')
const fs = require('fs')

// process.env.MSF_ENV 环境变量

// puppeteer配置
const puppConfig = {
  headless: Boolean(process.env.MSF_ENV),
  defaultViewport: {
    width: 1900,
    height: 1000,
    isLandscape: true
  },
  args: Boolean(process.env.MSF_ENV) ? [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--headless',
    '--no-zygote',
    '--disable-gpu',
    '--no-first-run',
    '--disable-dev-shm-usage',
    '--single-process'
  ] : ['--no-sandbox']
  // slowMo: 50,
  // 本机的chrome浏览器的位置
  // executablePath: 'C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
}
// form-data接收文件配置
const koaBodyConfig = {
  multipart: true,
  patchKoa: true,
  patchNode: true,
  urlencoded: true,
  formidable: {
    multipart: true,
    uploadDir: path.join(process.cwd() + '/upload'), // 设置文件上传目录
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 10485760, // 文件上传大小设置为10MB 1024*1024*
    onFileBegin: (name, file) => { // 文件上传前的设置
      const fp = path.join(process.cwd() + '/upload')
      if (!fs.existsSync(fp)) { // 检查是否有“upload”文件夹
        fs.mkdirSync(fp) // 没有就创建
      }
      const fileName = file.name.split('/')[file.name.split('/').length - 1]
      // file.path = path.join(process.cwd() + '/upload/' + new Date().toLocaleDateString() + new Date().toLocaleTimeString() + '.xlsx')
      // 指定上传文件的名称
      file.path = path.join(process.cwd() + '/upload/' + fileName)
    }
  }
}
// 测试环境mongo地址
const testMongo = {
  username: '',
  password: '',
  host: '190.168.0.17',
  database: 'db_xa_advt_manager',
  port: '27017'
}
// 正式环境mongo地址
const productionMongo = {
  username: 'MONGODB_USERNAME',
  password: 'MONGODB_PASSWORD',
  host: 'MONGODB_HOST',
  port: 'MONGODB_PORT',
  database: 'db_xa_advtmanager_cdiscount'
}
//  mongodb config
const mongo = process.env.MSF_ENV && process.env.MSF_ENV !== 'dev' ? productionMongo : testMongo
// 代理主机配置
const host = process.env.MSF_ENV ? '127.0.0.1' : '190.168.3.159'
// 账号代理配置
const proxy = {
  'Phenovo': `--proxy-server=SOCKS5://${ host }:1080`,
  'Prettyia': `--proxy-server=SOCKS5://${ host }:1081`,
  'Dolity11': `--proxy-server=SOCKS5://${ host }:1082`,
  'Blesiya': `--proxy-server=SOCKS5://${ host }:1083`,
  'Flameer': `--proxy-server=SOCKS5://${ host }:1084`,
  'Baoblaze': `--proxy-server=SOCKS5://${ host }:1085`,
  'Strade-store': `--proxy-server=SOCKS5://${ host }:1086`,
  'fenteer': `--proxy-server=SOCKS5://${ host }:1087`,
  'gazechimp': `--proxy-server=SOCKS5://${ host }:1088`
}
// 存储cookie
const cookie = {
  'Phenovo': {
    cookie: [],
    updateTime: ''
  },
  'Prettyia': {
    cookie: [],
    updateTime: ''
  },
  'Dolity11': {
    cookie: [],
    updateTime: ''
  },
  'Blesiya': {
    cookie: [],
    updateTime: ''
  },
  'Flameer': {
    cookie: [],
    updateTime: ''
  },
  'Baoblaze': {
    cookie: [],
    updateTime: ''
  },
  'Strade-store': {
    cookie: [],
    updateTime: ''
  },
  'fenteer': {
    cookie: [],
    updateTime: ''
  },
  'gazechimp': {
    cookie: [],
    updateTime: ''
  }
}
const account = {
  'Phenovo': {
    user: 'Phenovo',
    pass: ''
  },
  'Prettyia': {
    user: 'Prettyia',
    pass: ''
  },
  'Dolity11': {
    user: 'Dolity11',
    pass: ''
  },
  'Blesiya': {
    user: 'Blesiya',
    pass: ''
  },
  'Flameer': {
    user: 'Flameer',
    pass: ''
  },
  'Baoblaze': {
    user: 'Baoblaze',
    pass: ''
  },
  'Strade-store': {
    user: 'Strade-store',
    pass: ''
  },
  'fenteer': {
    user: 'fenteer',
    pass: ''
  },
  'gazechimp': {
    user: 'gazechimp',
    pass: ''
  },
}

// 导出配置
module.exports = {
  puppConfig, koaBodyConfig, mongo, proxy, cookie, account
}