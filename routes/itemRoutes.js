const express = require('express')
const router = express.Router()

const itemsController = require('../controllers/itemsController')

router.route('/')
.get(itemsController.getAllItems)
.post(itemsController.createNewItem)



router.route('/delete/:id').delete(itemsController.deleteItem)
router.route('/:id')
.get(itemsController.getAnItem)
router.route('/:id')
.patch(itemsController.updateItem)
// .delete(itemsController.deleteItem)

module.exports = router