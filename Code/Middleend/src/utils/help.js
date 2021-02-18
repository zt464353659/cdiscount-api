const fs = require('fs')
const path = require('path')
const axios = require('axios')
const pupp = require('puppeteer')
const { proxy, cookie, puppConfig, account } = require('../../config')

// 为模拟浏览器设置代理
function set_proxy(user, config) {
  if (proxy[user.account]) {
    config.args.push(proxy[user.account])
    user.with_proxy = true
  }
  console.log(`puppteer proxy => ${config.args}`)
}

// 清除模拟浏览器代理设置
function clear_proxy(user, config) {
  if (user.with_proxy) {
    config.args.pop()
    user.with_proxy = false
  }
}

// 杀死模拟浏览器进程
async function kill_process(browser) {
  if (process.env.MSF_ENV) {
    await browser.process().kill('SIGHUP')
  } else {
    await browser.process().kill()
  }
}

// 清理指定目录文件
function clear_file(fileName) {
  const files = fs.readdirSync(path.join(process.cwd() + fileName), { encoding: 'utf8' })
  if (files.length) {
    const originFiles = JSON.parse(JSON.stringify(files))
    originFiles.map(item => {
      console.log(`${process.cwd() + fileName + '/' + item}`)
      fs.unlinkSync(path.join(process.cwd() + fileName + '/') + item)
    })

  }
}

// 发送代理异常提醒
function alert_warning(msg) {
  return axios({
    url: `http://robot.cxiangnet.cn/robot.php`,
    method: 'get',
    params: {
      message: msg,
      phone: [17609102877]
    }
  })
}

// 存储指定账户cookie
async function get_cookie(user) {
  // 根据账号分配代理
  set_proxy(user, puppConfig)

  const browser = await pupp.launch(puppConfig)
  // 还原代理配置
  clear_proxy(user, puppConfig)
  try {
    const page = await browser.newPage()
    // 页面崩溃时抛错
    page.on('error', () => {
      throw new Error('23333')
    })
    // 设置进入页面超时时间
    page.setDefaultNavigationTimeout(6000000)
    // 打开cdiscount平台登陆页
    await page.goto('https://seller.cdiscount.com/login', { waitUntil: 'load' })
    await page.type('#Login', account[user.account].user)
    await page.type('#Password', account[user.account].pass)
    await page.click('#save')
    cookie[user.account].cookie = await page.cookies()
    cookie[user.account].updateTime = new Date().getTime()
  } catch (e) {

  } finally {
    await kill_process(browser)
  }
}

// 设置cookie
async function set_cookie(user, userPage) {

  // 判断当前账户是否存在cookie,cookie是否过期(平台2小时，设置1小时)
  if (cookie[user.account].cookie && (new Date().getTime() - cookie[user.account].updateTime < 3600000)) {
    // 未过期，直接设置
    cookie[user.account].cookie.forEach(async item => {
      await userPage.setCookie(item)
    })
  } else {
    // 过期，重新获取并设置
    await get_cookie(user)
    cookie[user.account].cookie.forEach(async item => {
      await userPage.setCookie(item)
    })
  }
}

// 返回消息
function response_data(response = {}, otherTip = {}) {
  return {
    code: response.code || 200,
    message: response.message || 'reply success',
    data: response.data || [],
    ...otherTip
  }
}

module.exports = {
  set_proxy,
  clear_proxy,
  kill_process,
  alert_warning,
  response_data,
  set_cookie
}