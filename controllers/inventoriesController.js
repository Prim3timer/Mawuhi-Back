const Inventory = require('../models/Inventory')
const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')
const {format} = require('date-fns');
const { useEffect } = require('react');

getAllInventory = asyncHandler( async(req, res) => {
    const inventory = await Item.find().lean()
    // if (!inventory?.length) {
    //     return res.status(400).json({ message: 'Nothing in stock' })
    // }
    res.json(inventory)
})
 
getAnInventory = async (req, res)=> {
    const {id} = req.params
    const inventory = await Inventory.findById({_id: id})
    res.send(inventory)
}

const createNewInventory= asyncHandler(async (req, res) => {
    var { name, qty} = req.body

    // Confirm data
    if (!name || !qty) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const now = new Date()
    // date = format(now, 'MM/dd/yyyy')
    const date = format(now, 'dd/MM/yyyy\tHH:mm:ss')
    const inventoryObject = { name, qty, date }

    // Create and store new item 
    const inventory = await Inventory.create(inventoryObject)

    if (inventory) { //created 
        res.status(201).json({ message: `New inventory ${name} created` })
    } else {
        res.status(400).json({ message: 'Invalid item data received' })
    }
})

const updatedInventory = asyncHandler(async (req, res) => {
    const { id} = req.params

    // Confirm data 
    if (!req.body.name || req.body.qty) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Does the user exist to update?
    const inventory = await Inventory.findById(id).exec()

    if (!inventory) {
        return res.status(400).json({ message: 'inventory not found' })
    }

    // Check for duplicate 
    // const duplicate = await inventory.findOne({ name }).lean().exec()
     const now = new Date()
    inventory.name = req.body.name
    inventory.qty = req.body.qty
    inventory.date = format(now, 'mm/dd/yyyy')


    const updatedInventory = await inventory.save()

    res.json({ message: `${updatedInventory.name} updated` })
})

let updateInventoryyy = async (req, res) =>{
    try {
        const id = req.params.id
        const name = req.body.name
        const qty =  req.body.qty
        const now = new Date()
      
        const currentInventory = await Inventory.findOneAndUpdate({
            _id: id}, 
           {
          name: req.body.name,
          qty,
          date:  format(now, 'dd/MM/yyyy\tHH:mm:ss')
      
      }, {new: true})
         await currentInventory.save()
      res.json(currentInventory)
    } catch (error) {
        res.status(500).json({error: 'something went wrong'})
    }
 
}

let updateInventory = async (req, res) =>{
    const id = req.params.id
    const now = new Date()
     const currentInventory = await Inventory.updateOne({
        _id: id}, 
         {
        name: req.body.name,
        qty: req.body.qty,
        date:  format(now, 'dd/MM/yyyy\tHH:mm:ss')

    })
//    await currentInventory.save()
    res.json(currentInventory)
}

const deleteInventory = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Inventory ID Required' })
    }



    // Does the user exist to delete?
    const inventory = await Inventory.findById(id).exec()

    if (!inventory) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await inventory.deleteOne()

    const reply = `Inventory ${inventory.username} with ID ${inventory._id} deleted`

    res.json(reply)
})   




module.exports = {
    getAllInventory,
    createNewInventory,
    updateInventory,
    deleteInventory,
    getAnInventory,
    updateInventoryyy ,
 

}