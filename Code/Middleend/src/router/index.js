const router = require('koa-router')()
// const { updateFile } = require('../controllers/uploadFile/index')
// const { getFileName } = require('../controllers/downloadFile/index')
// const { findId } = require('../controllers/findId/index')
const { messageReply } = require('../controllers/replyMessage')
// const { deleteProduct } = require('../controllers/deleteProduct')
const { getCookie } = require('../controllers/getCookie')
// router.post('/updateFile', updateFile)
// router.post('/getFileName', getFileName)
// router.post('/findId', findId)
router.post('/messageReply', messageReply)
// router.post('/deleteProduct', deleteProduct)
router.post('/get-cookie',getCookie)
module.exports = {
  router
}
// module.exportDefault = router