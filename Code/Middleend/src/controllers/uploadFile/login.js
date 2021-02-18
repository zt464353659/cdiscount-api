const pupp = require('puppeteer')
const fs = require('fs')
const path = require('path')
const { puppConfig, account } = require('../../../config')
const { set_proxy, clear_proxy, kill_process, alert_warning } = require('../../utils/help')

async function login(user) {

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
    // 登陆成功点击空白处关闭弹窗

    // 登陆成功点击空白处关闭弹窗
    //await page.goto('https://seller.cdiscount.com/', { waitUntil: 'load' })
    await page.waitFor(2000)
    await page.mouse.click(10, 10)
    await page.mouse.click(10, 10)
    // await page.waitFor(1500)
    await page.waitFor(500)
    await page.waitForSelector('div.subNav').then(async () => {
      console.log('==> find nav')
      await page.waitFor(1500)
      await page.click('div.subNav>li:last-child')
    }).catch(async () => {
      console.log('==> no nav')
      await page.waitFor(1000)
      await page.click('div.subNav>li:last-child')
    })
    //    await page.click('span.glyphicon-question-sign')
    //
    const entrance = await page.$('div.form-inline> a:nth-child(1)')
    const updateHref = await page.evaluate(entrance => entrance.href, entrance)
    await page.goto(updateHref, { waitUntil: 'load' })
    // 下拉框选择
    await page.select('select.form-control[name="j_id0:j_id5:j_id36:j_id37:caseTypeForm:casetype"]', 'Produits')
    await page.select('select.form-control[name="j_id0:j_id5:j_id36:j_id37:caseTypeForm:casesubtype"]', 'Modifier des informations produits')
    await page.waitFor(5000)
    await page.waitForSelector('#caseChannel')
    await page.waitFor(5000)
    await page.click('#channelCase')
    await page.waitFor(5000)
    const form = await page.waitForSelector('#channelCaseContent')
    if (form) {
      // 输入form表单的Objet、description值
      await page.type('input.form-control[name="j_id0:j_id5:j_id36:j_id37:caseTypeForm:casesubject"]', 'je vais ameliorer la description de mes produits')
      await page.type('textarea#caseDescText', 'je vais ameliorer la description de mes produits')
      // 上传文件的路径
      const elementHandle = await page.$('input[type="file"]')
      // 上传文件的路径
      elementHandle.uploadFile(path.join(process.cwd() + '/upload/') + user.file_name)
      await page.waitFor(500)
      await page.click('#help-drawer-toggle-menu')
      console.log('close slider')
      await page.waitFor(500)
      await page.click('#formSubmitter')
      await page.waitFor(500)
      const oldUrl = await page.url()
      await page.waitForSelector('#hideModal', { timeout: 500 }).then(async () => {
        console.log('find Modal')
        await page.click('#hideModal')
      }).catch(() => {
        console.log('no Modal')
      })
      // 等待5分钟页面跳转
      await page.waitFor(300000)
      const newUrl = await page.url()

      // 上传失败的处理
      if (oldUrl === newUrl) {
        user.retry++
        if (user.retry < 4) {
          console.log(`上传失败进行第${user.retry}次重试`)
          login(user)
        } else {
          console.log(`4次上传操作失败，上传失败！`)
        }
      } else {
        console.log(`${user.file_name}上传成功！`)
        // 删除文件
        fs.unlink(path.join(process.cwd() + '/upload/') + user.file_name, () => {
          console.log(`成功删除文件 ${user.file_name}`)
        })
      }
    }
  } catch (err) {
    // 代理故障时增加提示
    if (err.message.indexOf('ERR_PROXY_CONNECTION_FAILED') !== -1) {
      const msg = user.account === 'Phenovo' ? 'Cdiscount-API 1080端口代理异常' : 'Cdiscount-API 1081端口代理异常'
      user.proxy_failed = '代理故障'
      alert_warning(msg).then(() => {
        console.log('代理异常提醒')
      })
    }
    user.retry++
    if (user.retry < 4) {
      console.log(`用户 ${user.username} 上传失败进行第${user.retry}次重试`)
      login(user)
    } else {
      console.log(`4次上传操作失败，上传失败！`)
      // 删除文件
      fs.unlink(path.join(process.cwd() + '/upload/') + user.file_name, () => {
        console.log(`成功删除文件 ${user.file_name}`)
      })
    }
  } finally {
    // 杀死模拟浏览器进程
    await kill_process(browser)
  }
}

module.exports = {
  login
}
