const pupp = require('puppeteer')
const fs = require('fs')
const path = require('path')
const { puppConfig, account } = require('../../../config')
const { set_proxy, clear_proxy, kill_process, alert_warning } = require('../../utils/help')

async function findId(user) {

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
    //// 设置下载位置
    const download_path = path.join(process.cwd() + '/find')
    if (!fs.existsSync(download_path)) { // 检查是否有“find”文件夹
      fs.mkdirSync(download_path) // 没有就创建
    }
    // 设置进入页面超时时间
    page.setDefaultNavigationTimeout(6000000)
    // 打开cdiscount平台登陆页
    await page.goto('https://seller.cdiscount.com/login', { waitUntil: 'load' })
    await page.type('#Login', account[user.account].user)
    await page.type('#Password', account[user.account].pass)
    await page.click('#save')
    // 登陆成功点击空白处关闭弹窗

    // 登陆成功后进入报告页面
    await page.waitFor(2000)
    await page.goto('https://seller.cdiscount.com/Reports/All', { waitUntil: 'load' })
    await page.waitForSelector('#select')
    await page.select('#select', 'Product')
    await page.waitFor(5000)

    // 设置下载文件存放位置
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.join(process.cwd() + '/find')
    })
    const find_result = await page.evaluate(user => {
      const titles = document.querySelectorAll('table>tbody>tr>td:nth-child(3)')
      const href = document.querySelectorAll('table>tbody>tr>td:last-child')
      for (let i = 0; i < titles.length; i++) {
        if (titles[i].innerText === user.package_name) {
          if (href[i].children[0].href) {
            user.href = href[i].children[0].href
            return {
              href: href[i].children[0].href,
              can_download: true,
              exits_platform: true
            }
            return user
          } else {
            return {
              href: '',
              can_download: false,
              exits_platform: true
            }
          }
        }
      }
      return {
        href: '',
        can_download: false,
        exits_platform: false
      }
    }, user)
    await page.waitFor(500)
    user.find_package = find_result.exits_platform
    user.can_download = find_result.can_download
    // 链接下载后会抛出错误，等待下载逻辑应在catch中继续
    if (find_result.href) {
      await page.goto(find_result.href)
    }
  } catch (err) {
    console.log(`err.message => ${err.message}`)
    // 代理故障时增加提示
    if (err.message.indexOf('ERR_PROXY_CONNECTION_FAILED') !== -1) {
      const msg = user.account === 'Phenovo' ? 'Cdiscount-API--1080端口代理异常' : 'Cdiscount-API--1081端口代理异常'
      console.log(`msg ==> ${msg}`)
      user.proxy_failed = '代理故障'
      alert_warning(msg).then(() => {
        console.log('发送代理错误提醒')
      })
    }
  }
  finally {
    // 读取下载文件，组装返回值，删除文件
    const result = () => {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          const download_path = path.join(process.cwd() + '/find')
          const files = fs.readdirSync(download_path)
          let file_name
          if (files.length) {
            file_name = files[0]
            fs.unlinkSync(download_path + '/' + file_name)
          }
          resolve(file_name)
        }, 5000)
      })
    }
    return result().then(async res => {
     await kill_process(browser)
      if (user.proxy_failed) {
       return {
         code: 500,
         msg: user.proxy_failed
       }
      }
      if (user.can_download || user.find_package) {
        return {
          code: 200,
          msg: 'success',
          exits_platform: user.find_package,
          can_download: user.can_download,
          file_name: res
        }
      }
      return {
        code: 200,
        msg: 'success',
        exits_platform: user.find_package,
        can_download: user.can_download,
        file_name: ''
      }
    })
  }
}

module.exports = {
  findId
}
