    const express = require('express')
    const router = express.Router()

const inventoryController = require('../controllers/inventoriesController')

router.route('/')
.get(inventoryController.getAllInventory)
.post(inventoryController.createNewInventory)

router.route('/:id')
.get(inventoryController.getAnInventory)
// .patch(inventoryController.updateInventory)
router.route('/:id').delete(inventoryController.deleteInventory)
router.route('/:id').patch(inventoryController.updateInventory)


module.exports = router