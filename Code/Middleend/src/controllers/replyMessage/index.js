const pupp = require('puppeteer')
const { puppConfig } = require('../../../config')
const { set_proxy, clear_proxy, kill_process, alert_warning, set_cookie, response_data } = require('../../utils/help')

async function messageReply(user) {
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
    // 设置cookie
    await set_cookie(user, page)

    // 设置进入页面超时时间1小时
    page.setDefaultNavigationTimeout(3600000)
    await page.waitFor(500)
    // 英文界面
    await page.goto('https://seller.cdiscount.com/Messages?language=en-GB', { waitUntil: 'networkidle2' })
    const exist = await page.evaluate(user => {
      let exist = false
      const messageList = document.getElementById('MessagesListContainer')
      const authorList = document.querySelectorAll('#MessagesListContainer>li>a h2')
      const contentList = document.querySelectorAll('#MessagesListContainer>li>a')
      const nameArr = user.custom ? user.custom.split(' ') : ''
      let sender = ''
      if (nameArr.length === 3) {
        sender = `${nameArr[0]} ${nameArr[2]} ${nameArr[1]}`
      } else if (nameArr.length === 5) {
        sender = `${nameArr[0]} ${nameArr[3]} ${nameArr[4]} ${nameArr[1]} ${nameArr[2]}`
      }
      if (user.order_id) {
        for (let i = 0; i < authorList.length; i++) {
          if (contentList[i].innerText.toLowerCase().indexOf(user.order_id.toLowerCase()) !== -1) {
            messageList.children[i].click()
            exist = true
          }
        }
      } else {
        if (user.custom && user.content) {
          for (let i = 0; i < authorList.length; i++) {
            if (authorList[i].innerHTML.toLowerCase() === sender.toLowerCase() && contentList[i].innerText.toLowerCase().indexOf(user.content.toLowerCase()) !== -1) {
              messageList.children[i].click()
              exist = true
            }
          }
        }
      }
      return exist
    }, user)
    if (exist) {
      const textarea = await page.waitForSelector('#messageContent')
      if (textarea) {
        await page.type('#messageContent', user.message)
      }
      const submit = await page.waitForSelector('div.col-md-8')
      if (submit) {
        await page.evaluate(() => {
          const submitButton = document.getElementsByClassName('col-md-8')[0].children[0]
          // 提交消息
          submitButton.click()
        })
        return response_data()
      }
    }
    else {
      return response_data({ code: 400, message: 'not exist' })
    }
  } catch (err) {
    console.log(`err.message => ${err.message}`)
    // 代理故障时增加提示
    // if (err.message.indexOf('ERR_PROXY_CONNECTION_FAILED') !== -1) {
    //   const msg = user.account === 'Phenovo' ? 'Cdiscount-API--1080端口代理异常' : 'Cdiscount-API--1081端口代理异常'
    //   // console.log(`msg ==> ${msg}`)
    //   user.proxy_failed = '代理故障'
    //   alert_warning(msg).then(() => {
    //     console.log('发送代理错误提醒')
    //   })
    // }
    return response_data({ code: 400, message: 'reply failed' }, { failed_reason: err.message })
  }
  finally {
    // 关进程
    await kill_process(browser)
  }
}

module.exports = {
  messageReply: async function (ctx) {
    const body = ctx.request.body
    if (!body.account || !body.message) {
      ctx.body = {
        code: 405,
        msg: '请求缺少参数',
        data: []
      }
      return
    }
    ctx.body = await messageReply(body)
  }
}