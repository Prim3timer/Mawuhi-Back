const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')

const getAllItems = asyncHandler(async (req, res) => {
    const items = await Item.find().lean()

    if (!items?.length) {
        return res.status(400).json({ message: 'No items found' })
    }

    res.json({items})
})

const createNewItem = asyncHandler(async (req, res) => {
    const { name, unitMeasure, price, piecesUnit  } = req.body
    const items = await Item.find()
    console.log(items)
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
    console.log(Item)

    if (item) { //created 
        res.status(201).json({ message: `New item ${name} created` })
    } else {
        res.status(400).json({ message: 'Invalid item data received' })
    }
})



const updateItem = asyncHandler(async (req, res) => {
    const {name, unitMeasure, description, price} = req.body

    const id = req.params.id
     const currentItem = await Item.updateOne({
        _id: id}, 
         {
        name,
        unitMeasure,
        description,
        price
    })



    res.json(`'${currentItem.name}' updated`)
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

getAnItem = async (req, res)=> {
    const {id} = req.params
    const item = await Item.findById({_id: id})
    res.send(item)
}


module.exports = {
    getAllItems,
    createNewItem,
    updateItem,
    deleteItem,
    getAnItem
}

