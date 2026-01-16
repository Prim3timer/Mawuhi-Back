require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const connectDB = require('./config/dbconn')
const mongoose = require('mongoose')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const errorHandler = require('./middleware/errorHandler');
const {logEvents, logger} = require('./middleware/logger')
const verifyJWT = require('./middleware/verifyJwT')
// const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');
const multer = require('multer')
const fs = require('fs')
const Item = require('./models/Item')


// console.log(process.env.NODE_ENV)

const PORT = process.env.PORT || 3500
// const stripe = require('stripe')(process.env.STIPE_PRIVATE_KEY)
connectDB()
    
app.use(logger)
app.use(cors(corsOptions))

app.use(express.json())


const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
            // const { name, unitMeasure, price, image, now  } = req.body
        const {name} = req.params
        const files = file
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



app.post('/items/pic/upload/:name', upload.array('images', 5), async (req, res)=> {
    console.log({reqParams: req.files})  

              let fiver = []
    let i = 0;
    while (i < 5){
        fiver.push({id: i + 1, name: 'no image'})
        i++
    }
    const {name} = req.params
    console.log({name})
    const fileNames = req.files.map((file, index) => {
        fiver.splice(index, 1, {id: index + 1, name: file.originalname})
        return {id: index + 1, name: file.originalname}

    })
    console.log({fiver})
    const response = await Item.find({name})
    console.log({response})
    if (response){
        console.log({id: response[0]._id})
        await Item.findOneAndUpdate({_id: response[0]._id},
            {img: fiver}
        )
    }
    res.send('uploaded')
})

// for adding a single image to the collage
app.patch('/items/pic/:name', upload.single('image'), async (req, res)=> {
    console.log({file: req.file})  
    const {name} = req.params
    const initialPic = req.query.initialPic
    const id = req.query.id
    const fiveArray = req.query.fiveArray
    // const index = req.query.index
    const jsonized = JSON.parse(fiveArray)
    console.log({id, jsonized, name, initialPic})


console.log('hello world')
    // console.log(fileNames)
    const response = await Item.find({_id: id})
    if (response){
        console.log({response})
//    response[0].img.splice(Number(index -1), 1, newItem)
        const respponse2 = await Item.findOneAndUpdate({_id: id},
            {
                
                img: jsonized}
        )
    }
    res.send('image successfully uploaded')
})

// for deleting a single image from the collage
app.delete('/delete-pic/:initialPic', async (req, res) => {
    const initialPic = req.params.initialPic
    const name = req.query.name
    const id = req.query.id
    const item = await Item.findById(id)

    try {
        
        const currentPics = item.img.map((image) => {
            if (image.name === initialPic){
                return {...image, name: 'no image'}
            }
            return image
        })
        console.log({currentPics})
        // console.log({initialPic, name, item, id, currentPics})
        console.log('hello pick')
        await Item.findOneAndUpdate({_id: id},
            {img: currentPics}
        )
           const data = await fs.promises.readdir(path.join(__dirname, 'public', 'images', name))
              console.log({content: data.length})
                 if (fs.existsSync(path.join(__dirname, 'public', 'images', name, initialPic))){
    
            await fs.promises.unlink(path.join(__dirname, 'public', 'images', name, initialPic))
            res.send('file successfully deleted')
           
        }
    } catch (error) {
            res.json({message: error.message})
    }
})

app.use(cookieParser());    

app.use('/', express.static(path.join(__dirname, 'public')))    


app.use('/', require('./routes/root'))  
app.use('/results', require('./routes/resultRoutes'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/register', require('./routes/registerRoutes'))
app.use('/sessions', require('./routes/sessionsRoutes'))
app.use('/refresh', require('./routes/refreshRoutes'))
// app.use('/create-checkout-session', require('./routes/cartRoutes'))

app.use('/transactions', require('./routes/transactionRoutes'))
app.use('/items', require('./routes/itemRoutes'))   
app.use(verifyJWT); 
app.use('/users', require('./routes/userRoutes'))   




    app.all('/*', (req, res)=> { 
        // res.status(404)
        if (req.accepts('html')){
            res.sendFile(path.join(__dirname, 'views', '404.html'))
        } else if (req.accepts('json')){
            res.json({message: '404 not found'})
        }else {
            res.type('txt').send('404 not found')
        }
    })



    app.use(errorHandler);
    mongoose.connection.once('open', ()=> {
        console.log('connected to mongoDB')
        app.listen(PORT, ()=> console.log(`Server runnning on port ${PORT}`))
    })

    mongoose.connection.on('error', (error) => {
        console.log(error)
        logEvents(`${error.no}: ${error.code}\t ${error.syscall}\t${error.hostname}`,
            'mongoErrLog.log'
        )
    })
