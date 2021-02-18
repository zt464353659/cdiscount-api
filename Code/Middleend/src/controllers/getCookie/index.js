const pupp = require('puppeteer')
const { puppConfig, account } = require('../../../config')
const { set_proxy, clear_proxy, kill_process } = require('../../utils/help')

async function getCookie(user) {
  // 根据账号分配代理
  set_proxy(user, puppConfig)

  const browser = await pupp.launch(puppConfig)
  // 还原代理配置
  clear_proxy(user, puppConfig)
  try {
    const page = await browser.newPage()

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      })
    })

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
    await page.waitFor(5000)
    const ulList = await page.waitForSelector('#bs-navbar-collapse', { timeout: 10000 })
    // 登录成功 出现列表
    if(ulList) {
      const cookie = await page.cookies()
      return {
        code: 200,
        message: 'success',
        cookie
      }
    }
  } catch (err) {
    console.log(err)
    return {
      code: 405,
      message: err.message
    }
  } finally {
    await kill_process(browser)
  }
}

module.exports = {
  getCookie: async function (ctx) {
    const body = ctx.request.body
    if (!body.account) {
      ctx.body = {
        code: 405,
        msg: '请求缺少参数',
        data: []
      }
      return
    }
    ctx.body = await getCookie(body)
  }
}