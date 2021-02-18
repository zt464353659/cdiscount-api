const pupp = require('puppeteer')
const fs = require('fs')
const path = require('path')
const { puppConfig, proxy, account } = require('../../../config')
const saveFile = require('../../utils/db')
const { set_proxy, clear_proxy, kill_process, alert_warning } = require('../../utils/help')

async function download(user) {
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
    const fp = path.join(process.cwd() + '/download')
    if (!fs.existsSync(fp)) { // 检查是否有“download”文件夹
      fs.mkdirSync(fp) // 没有就创建
    }
    page.setDefaultNavigationTimeout(6000000)
    await page.goto('https://seller.cdiscount.com/login')
    await page.type('#Login', account[user.account].user)
    await page.type('#Password', account[user.account].pass)
    await page.click('#save')
    // 关闭弹窗广告
    await page.waitForSelector('div#dfpCB').then(async () => {
      await page.click('div#dfpCB')
      // console.log('close AD')
    }).catch(() => {
    })
    // 跳转至导出文件页面
    await page.goto('https://seller.cdiscount.com/stock/management', { waitUntil: 'networkidle2' })
    await page.waitForSelector('div.table-responsive>table>thead>tr:first-child>th:first-child>input.jsCheckTableAll', { timeout: 0 }).then(async () => {
      await page.click('div.table-responsive>table>thead>tr:first-child>th:first-child>input.jsCheckTableAll')
    })
    await page.waitFor(2000)
    // 判断当前下载功能是否直接可用（当天已经生成过的文件不用再次生成，可以直接下载）
    const canDownload = await page.evaluate(() => {
      return document.querySelector('div.export-offers>div.row>a:nth-child(2)').className.indexOf('disabled') < 0
    })
    console.log(`canDownload ==> ${canDownload}`)
    if (!canDownload) {
      // 不能直接下载 执行生成流程
      await page.click('div.export-offers>div.row>a:first-child')
      //     // 等待弹出窗口后点击确定
      page.waitFor(5000)
      await page.evaluate(() => {
        const modal = document.querySelectorAll('div.modal>div.popinCentered>div.modal-content>div.modal-footer>button.right')
        modal[1].click()
      })
      // 等待文件生成时间 40分钟
      await page.waitFor(2400000)
    }
    // 设置下载文件存放位置
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.join(process.cwd() + '/download')
    })
    if (!canDownload) {
      // 避免页面延迟，手动刷新页面
      await page.reload(0, { waitUntil: 'networkidle2' })
    }
    // 点击下载
    const download_elem = await page.$('div.export-offers>div.row>a:nth-child(2)')
    await page.evaluate(async download_elem => {
      download_elem.click()
    }, download_elem)
    // 开始下载 =》下载完成 预计10s
    await page.waitFor(10000)
    let file_name
    for (let i = 0; i < 100; i++) {
      // 读取下载文件
      const files = fs.readdirSync(path.join(process.cwd() + '/download'), { encoding: 'utf8' })
      const year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      let date = new Date().getDate()
      if (date < 10) {
        date = '0' + date
      }
      if (month < 10) {
        month = '0' + month
      }
      const today = `${year}${month}${date}`
      if (files.length) {
        files.forEach(item => {
          if (item.indexOf(today) !== -1) {
            console.log(`downloadFile => ${item}`)
            file_name = item
          }
        })
      }
      if (file_name && file_name.indexOf('crdownload') > 0) {
        // 如果文件没有下载好就重复等待，最长等待100分钟
        console.log(`等待文件下载第${i + 1}次`)
        await page.waitFor(60000)
      } else {
        console.log(`文件在第${i}次等待后下载完成，耗时${i }分钟10s`)
        break
      }
    }

    saveFile(`offres_${user.account}.xlsx`, path.join(process.cwd() + '/download/' + file_name), user.id).then(result => {

      // 写入完成立即删除
      const download_files = fs.readdirSync(path.join(process.cwd() + '/download'), { encoding: 'utf8' })
      if (download_files.length) {
        const arr = JSON.parse(JSON.stringify(download_files))
        arr.forEach(item => {
          fs.unlinkSync(path.join(process.cwd() + '/download/' + item))
        })
      }
      console.log('写入完成，删除文件')
    })
  } catch (err) {
    // 代理故障时增加提示
    if (err.message.indexOf('ERR_PROXY_CONNECTION_FAILED') !== -1) {
      const msg = user.account === 'Phenovo' ? 'Cdiscount-API 1080端口代理异常' : 'Cdiscount-API 1081端口代理异常'
      user.proxy_failed = '代理故障'
      alert_warning(msg).then(() => {
        console.log('发送代理异常提醒')
      })
    }
    user.retry++
    if (user.retry < 4) {
      console.log(`用户 ${user.username} 下载出错，进行第${user.retry}次重试`)
      download(user)
    } else {
      console.log(`4次操作失败，下载失败！`)
      console.log(`err: \n${err}`)
    }
  } finally {
    // 杀死模拟浏览器进程
    await kill_process(browser)
  }
}

module.exports = {
  download
}
