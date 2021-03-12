const controller = require('../controllers/clients')
const validate = require('../controllers/clients.validate')
const AuthController = require('../controllers/auth')
const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')

/*
 * Cities routes
 */

/*
 * Get all items route
 */
router.get('/all', controller.getAllItems)

/*
 * Get items route
 */
router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  controller.getItems
)

router.post(
  '/exelpost',
  // requireAuth,
  // AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  // validate.postExel,
  controller.upload.single('file'),
  controller.uploadExcel
)

/*
 * Create new item route
 */
router.post(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.createItem,
  controller.createItem
)

router.get(
  '/random',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  // validate.getItem,
  controller.getRamdom
)


router.get(
  '/refeshusers',
  // requireAuth,
  // AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  // validate.getItem,
  controller.GetDataApsquarespace
)


router.get(
  '/getamount',
  // requireAuth,
  // AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  // validate.getItem,
  controller.GetDataAmountScuare
)


/*
 * Get item route
 */
router.get(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.getItem,
  controller.getItem
)

router.get(
  '/client/:id',
  trimRequest.all,
  validate.getItem,
  controller.getClient
)

/*
 * Update item route
 */
router.patch(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.updateItem,
  controller.updateItem
)

/*
 * Delete item route
 */
router.delete(
  '/:id',
  requireAuth,
  AuthController.roleAuthorization(['admin']),
  trimRequest.all,
  validate.deleteItem,
  controller.deleteItem
)

module.exports = router
