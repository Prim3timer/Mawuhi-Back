const multer = require('multer')

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
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
        return req.files
    },
    filename: (req, file, cb) => {
         cb(null, file.originalname)
    
    }
})




module.exports =  multer({
    storage
})