const Item = require('../models/Item')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const {format, yearsToDays} = require('date-fns');
const { default: nodemon } = require('nodemon');
const fs = require('fs')
const path = require('path')
const multer = require('multer')



const getAllItems = asyncHandler(async (req, res) => {
    const items = await Item.find().lean()
    //  const newData = await fsPromises.readFile(path.join(__dirname, '..', 'images', 'credit.jpg' ), 'utf8')
    // console.log(newData)
    if (!items?.length) {
        return res.status(400).json({ message: 'No items found' })
    }

    res.json({items})
})


const createNewItem = asyncHandler(async (req, res) => {
    const { name, unitMeasure, price, image, now, description } = req.body
    console.log({image})
    const items = await Item.find()
    const qty = 0
    const date = now
    const img = image
    console.log({description})
    // Confirm data
    if (!name || !unitMeasure || !price) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username 
    const duplicate = await Item.findOne({ name, unitMeasure}).collation({ locale: 'en', strength: 2 }).lean().exec()



    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate item' })
    }


    const itemObject = {name, unitMeasure, price, qty, date, img, description}

    // Create and store new item 
    const item = await Item.create(itemObject)

    if (item) { //created 
        
        res.status(201).json({ message: `New item ${name} created` })
        
    } else {
        res.status(400).json({ message: 'Invalid item data received' })
    }
 
 
})



const storage = multer.diskStorage({
    destination: async (req, file, cb, next) => {
            // const { name, unitMeasure, price, image, now  } = req.body
        const name = req.params.name
        const files = req.file
        console.log({file})
        console.log({name})
        // console.log({fileO: req.files})
            if (!fs.existsSync(path.join(__dirname, '..', 'public', 'images', `./${name}`))){
            await fs.promises.mkdir(path.join(__dirname, '..', 'public', 'images', `./${name}`))
            cb(null, `./public/images/${name}`)
            console.log(`${name} created`) 
        } else cb(null, `./public/images/${name}`)
    },
    filename: (req, file, cb) => {
         cb(null, file.originalname)
    }
})

const upload = multer({
    storage
})


const updateImage = asyncHandler( upload.single('image'), async (req, res) => {
    console.log('hello singles')
    console.log({filename: req.file.originalname})
})

const updateItem = asyncHandler(async (req, res) => {
    const {name, unitMeasure, price, img} = req.body
    // console.log({body: req.file})
    console.log({newItem: req.query.newItem})

    // const id = req.params.id
    //  const currentItem = await Item.findOneAndUpdate({
    //     _id: id}, 
    //      {
    //     name: name || '',
    //     unitMeasure: unitMeasure || '',
    //     price: price || '',
    //     img: img || ''
    // })



    // res.json(`'${currentItem.name}' updated`)
    res.json(`updated`)
})


let updateInventoryyy = async (req, res) =>{
    const {id} = req.params
    try {
        const {name, date} = req.body
       
      
        const currentInventory = await Item.findOneAndUpdate({
          _id: id   }, 
           {
          name: req.body.name,
          qty: req.body.qty,
          date
      
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
          date:  req.body.date
      
      }, {new: true})
         await currentInventory.save()
      res.json(currentInventory)
    } catch (error) {
        res.status(500).json({error: 'something went wrong'})
    }
 
}


const updateItemTexts = asyncHandler( async (req, res) => {
    const obj = req.params.obj
    const id = req.query.id
    const newItem = JSON.parse(obj)
    const { name, unitMeasure, price, quantity, description, date} = newItem
    console.log({newItem, id})
    const currentItem = await Item.findById(id)
    if (currentItem){
        await Item.findByIdAndUpdate({_id: id},
            {
                name,
                unitMeasure,
                price,
                qty: quantity   ,
                description,
                date
            }
        )
    }
    res.json({message: `${currentItem.name} successfuly updated`})
})

const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params
    const name = req.query.name
    console.log({name})

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
 if (fs.existsSync(path.join(__dirname, '..', 'public', 'images', `./${name}`))){

     const data = await fs.promises.readdir(path.join(__dirname, '..', 'public', 'images', name))
     console.log({content: data.length})
     if (data.length){ 
         data.map( async (file)=> {
          await fs.promises.unlink(path.join(__dirname, '..', 'public', 'images', name, file))
         })
        } 
        await fs.promises.rmdir(path.join(__dirname, '..', 'public', 'images', name))
    }
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
    updateInventoryy,
    updateImage,
    updateItemTexts
    // upload
}


