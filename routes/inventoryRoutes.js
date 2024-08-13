const express = require('express')
const router = express.Router()

const inventoryController = require('../controllers/inventoriesController')

router.route('/')
.get(inventoryController.getAllInventory)
.post(inventoryController.createNewInventory)

router.route('/:id')
.get(inventoryController.getAnInventory)
.put(inventoryController.updateInventory)
router.route('/:id').delete(inventoryController.deleteInventory)


module.exports = router