const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')
const {format, yearsToDays} = require('date-fns');
const { default: nodemon } = require('nodemon');

const getAllItems = asyncHandler(async (req, res) => {
    const items = await Item.find().lean()

    if (!items?.length) {
        return res.status(400).json({ message: 'No items found' })
    }

    res.json({items})
})

const createNewItem = asyncHandler(async (req, res) => {
    const { name, unitMeasure, price  } = req.body
    const items = await Item.find()
    const qty = 0
    const now = new Date()
    const date = format(now, 'dd/MM/yyyy\tHH:mm:ss')
    // Confirm data
    if (!name || !unitMeasure || !price) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username 
    const duplicate = await Item.findOne({ name, unitMeasure}).collation({ locale: 'en', strength: 2 }).lean().exec()



    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate item' })
    }


    const itemObject = {name, unitMeasure, price, qty, date }

    // Create and store new item 
    const item = await Item.create(itemObject)

    if (item) { //created 
        res.status(201).json({ message: `New item ${name} created` })
    } else {
        res.status(400).json({ message: 'Invalid item data received' })
    }
})



const updateItem = asyncHandler(async (req, res) => {
    const {name, unitMeasure, price} = req.body

    const id = req.params.id
     const currentItem = await Item.findOneAndUpdate({
        _id: id}, 
         {
        name,
        unitMeasure,
        price
    })



    res.json(`'${currentItem.name}' updated`)
})


let updateInventoryyy = async (req, res) =>{
    const {id} = req.params
    try {
        const name = req.body.name
        const now = new Date()
      
        const currentInventory = await Item.findOneAndUpdate({
          _id: id   }, 
           {
          name: req.body.name,
          qty: req.body.qty,
          date:  format(now, 'dd/MM/yyyy\tHH:mm:ss')
      
      }, {new: true})
         await currentInventory.save()
      res.json(currentInventory)
    } catch (error) {
        res.status(500).json({error: 'something went wrong'})
    }
 
}
let updateInventoryy = async (req, res) =>{
    try {
        const name = req.body.name
        const now = new Date()
      
        const currentInventory = await Item.findOneAndUpdate({
          name: name}, 
           {
          name: req.body.name,
          qty: req.body.qty,
          date:  format(now, 'dd/MM/yyyy\tHH:mm:ss')
      
      }, {new: true})
         await currentInventory.save()
      res.json(currentInventory)
    } catch (error) {
        res.status(500).json({error: 'something went wrong'})
    }
 
}

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
    getAnItem,
    updateInventoryyy,
    updateInventoryy
}


// opt: 1 id Number
// opt: 2 yes | check status (for no call back)
// have you tried to recover your passowrd: yes
 

// opt: 3: have you already requested a passord reset: no

// a ref number will be issued: should be kept safe

// ticket: inc000009127640
