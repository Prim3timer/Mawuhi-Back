const express = require('express')
const router = express.Router()

const transactionsController = require('../controllers/transactionsController.js')

router.route('/create-checkout-session').post(transactionsController.makePayment)
router.route('/')
.get(transactionsController.getAllTransactions)
.post(transactionsController.createNewTransaction)
router.route('/:id')
.delete(transactionsController.deleteTransaction)

// router.route('/').get(transactionsController.makePayment)




// router.route('/sales').get(transactionsController.getSales)

module.exports = router