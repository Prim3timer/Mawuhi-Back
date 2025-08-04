const Item = require('../models/Item')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
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
    const {name, unitMeasure, price, img} = req.body

    const id = req.params.id
     const currentItem = await Item.findOneAndUpdate({
        _id: id}, 
         {
        name: name || '',
        unitMeasure: unitMeasure || '',
        price: price || '',
        img: img || ''
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



// this update user function is here because ever since i put the getUsers function inside
// a useEffect in the Users Component, http requests made to the users route always fails.
// The getUsers function has to do with refresh token and access token matter.
const updateUser = asyncHandler(async (req, res) => {
    const {roles, username, password, active} = req.body
    
    console.log(active)
    const id = req.params.id
  
    const foundUser  = await User.findById(id).exec()
    if (foundUser){
        
            const currentItem = await User.findOneAndUpdate({
               _id: id}, 
                {
                    username,
              roles,
              active,
              password: password ? await bcrypt.hash(password, 10) : foundUser.password,
           })

    
           res.json(`${currentItem.username} Updated`)
    }



})

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'User ID required' })
    }

    // Confirm note exists to delete 
    const results = await User.findByIdAndDelete(id).exec()

    if (!results) {
        return res.status(400).json({ message: 'Item not found' })
    }

    // const result = await User.deleteOne({_id: id})
console.log(results)
    const reply = `${results.username}  Deleted`

    res.json(reply)
})


module.exports = {
    getAllItems,
    createNewItem,
    updateItem,
    deleteItem,
    getAnItem,
    updateInventoryyy,
    updateInventoryy,
    updateUser,
    deleteUser
}


