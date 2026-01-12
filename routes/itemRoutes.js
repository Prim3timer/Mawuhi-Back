const express = require('express')
const router = express.Router()
const itemsController = require('../controllers/itemsController')
const multer = require('multer')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
            const { name, unitMeasure, price, image, now  } = req.body
        // const {name} = req.params
        const files = req.files
        console.log({files})
        console.log({name})
        // console.log({fileO: req.files})
            if (!fs.existsSync(path.join(__dirname, 'public', 'images', `./${name}`))){
            await fs.promises.mkdir(path.join(__dirname, 'public', 'images', `./${name}`))
            cb(null, `./public/images/${name}`)
            console.log(`./${name} created`) 
        } else cb(null, `./public/images/${name}`)
    },
    filename: (req, file, cb) => {
         cb(null, file.originalname)
    }
})

const upload = multer({
    storage
})

// const uploadMultiple = upload.array('images', 5)

router.route('/')
.get(itemsController.getAllItems)

router.route('/')
.post(itemsController.createNewItem)


// router.route('/pic/:name')
// .post(itemsController.updateImage)


router.route('/delete/:id').delete(itemsController.deleteItem)  
router.route('/:id')
.get(itemsController.getAnItem)
router.route('/:id')
.patch(itemsController.updateItem)
router.route('/inventory/:id')
.patch(itemsController.updateInventoryyy)
router.route('/dynam')
.put(itemsController.updateInventoryy)



module.exports = router