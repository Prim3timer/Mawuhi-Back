const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')

const getAllItems = asyncHandler(async (req, res) => {
    const items = await Item.find().lean()

    if (!items?.length) {
        return res.status(400).json({ message: 'No items found' })
    }

    res.json(items)
})

const createNewItem = asyncHandler(async (req, res) => {
    const { name, unitMeasure, price, piecesUnit  } = req.body
    const items = await Item.find()
    // Confirm data
    if (!name || !unitMeasure || !price) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username 
    const duplicate = await Item.findOne({ name, unitMeasure}).collation({ locale: 'en', strength: 2 }).lean().exec()



    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate item' })
    }


    const itemObject = {name, unitMeasure, price, piecesUnit }

    // Create and store new item 
    const item = await Item.create(itemObject)

    if (item) { //created 
        res.status(201).json({ message: `New item ${name} created` })
    } else {
        res.status(400).json({ message: 'Invalid item data received' })
    }
})



const updateItem = asyncHandler(async (req, res) => {
    const {name, unitMeasure, description, price} = req.body

    // Confirm data
    // if (!id || !name || !unitMeasure) {
    //     return res.status(400).json({ message: 'All fields are required' })
    // }

    // Confirm item exists to update
    const item = await Item.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

    // Check for duplicate name
    const duplicate = await Item.findOne({ name }).lean().exec()

    // Allow renaming of the original item
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate item name' })
    }

    item.name = name
    item.description = description
    item.price = price
    item.unitMeasure = unitMeasure

    const updatedItem = await item.save()

    res.json(`'${updatedItem.name}' updated`)
})

const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const item = await Item.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Item not found' })
    }

    const result = await item.deleteOne()

    const reply = `Item '${item.name}' with ID ${item._id} deleted`

    res.json(reply)
})


module.exports = {
    getAllItems,
    createNewItem,
    updateItem,
    deleteItem
}

