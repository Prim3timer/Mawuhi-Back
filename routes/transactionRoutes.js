const express = require('express')
const router = express.Router()

const transactionsController = require('../controllers/transactionsController.js')

router.route('/')
.get(transactionsController.getAllTransactions)
.post(transactionsController.createNewTransaction)
router.route('/:id')
.delete(transactionsController.deleteTransaction)




// router.route('/sales').get(transactionsController.getSales)

module.exports = router