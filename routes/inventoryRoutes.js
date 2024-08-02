const express = require('express')
const router = express.Router()

const inventoryController = require('../controllers/inventoriesController')

router.route('/')
.get(inventoryController.getAllInventory)
.post(inventoryController.createNewInventory)
.delete(inventoryController.deleteInventory)

router.route('/:id').get(inventoryController.getAnInventory)
router.route('/:id').put(inventoryController.updateInventory)


module.exports = router