const express = require('express')
const router = express.Router()

const transactionsController = require('../controllers/transactionsController.js')
const sessionsController = require('../controllers/sessionsController.js')

// router.route('/create-checkout-session').post(transactionsController.makePayment)
router.route('/')
.get(transactionsController.getAllTransactions)
.post(transactionsController.createNewTransaction)
router.route('/:id')
.delete(transactionsController.deleteTransaction)

router.route('/create-checkout-session').post(transactionsController.makePayment)

router.route('/sessions/:sessionId').post(sessionsController.thanksAlert)

router.route('/status-update/:id').put(transactionsController.statusUdate)


// router.route('/sales').get(transactionsController.getSales)

module.exports = router