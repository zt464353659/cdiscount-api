const pupp = require('puppeteer')
const { puppConfig } = require('../../../config')
const { set_proxy, clear_proxy, kill_process, set_cookie, response_data } = require('../../utils/help')

async function deleteProduct(user) {
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
    // 设置cookie
    await set_cookie(user, page)

    // 设置进入页面超时时间1小时
    page.setDefaultNavigationTimeout(3600000)
    await page.waitFor(500)
    await page.goto(`https://seller.cdiscount.com/stock/management/LastUpdateDateDescending/All/AllOffersOnly/1/${user.sku}`, { waitUntil: 'networkidle2' })
    const expand = await page.waitForSelector('#stockManagementMainContentLines a[data-toggle="dropdown"]',{timeout: 10000})

    await page.click('#stockManagementMainContentLines a[data-toggle="dropdown"]')
    await page.waitFor(3000)
    // 点击取消发布
    await page.evaluate(async () => {
      const li = document.querySelectorAll('#stockManagementMainContentLines>tr:first-child>td:last-child>div.btn-group>ul.dropdown-menu>li>a')
      // 先取消发布
      for (let i = 0; i < li.length; i++) {
        if (li[i].innerText === 'Dépublier') {
          li[i].click()
        }
      }
    })
    await page.waitFor(3000)
    await page.mouse.click(10, 10)
    await page.evaluate(() => {
      const li = document.querySelectorAll('#stockManagementMainContentLines>tr:first-child>td:last-child>div.btn-group>ul.dropdown-menu>li>a')
      // 删除广告
      for (let i = 0; i < li.length; i++) {
        if (li[i].innerText === 'Supprimer produit') {
          li[i].click()
        }
      }
      document.querySelector('#Modal_Delete_Confirm #Button_Delete_Confirm').click()
    })

    await page.waitFor(5000)
    const success = await page.evaluate(() => {
      let handleResult = false
      const resultContent = document.querySelectorAll('.modal-content')[3].children[1].innerText
      console.log(resultContent)
      if (resultContent === 'Ce(s) produit(s) a(ont) été supprimé(s) avec succès. Cela peut prendre quelques heures pour qu\'il(s) disparaisse(nt) de votre catalogue.') handleResult = true
      return handleResult
    })
    if (success) {
      return response_data({ message: 'delete success' })
    }
    return response_data({code: 400,message: 'unexpected mistakes'})
    // Dépublier 取消发布
    // 筛选列表中结果
  } catch (err) {
    console.log(`err.message => ${err.message}`)
    return response_data({ code: 400, message: 'delete failed' }, { failed_reason: err.message })
  }
  finally {
    // 关进程
    await kill_process(browser)
  }
}

module.exports = {
  deleteProduct: async function (ctx) {
    const body = ctx.request.body
    if (!body.account || !body.sku) {
      ctx.body = {
        code: 405,
        msg: '请求缺少参数',
        data: []
      }
      return
    }
    ctx.body = await deleteProduct(body)
  }
}