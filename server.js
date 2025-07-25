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


// console.log(process.env.NODE_ENV)

const PORT = process.env.PORT || 3500
// const stripe = require('stripe')(process.env.STIPE_PRIVATE_KEY)
connectDB()
    
app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser());    

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))  
app.use('/results', require('./routes/resultRoutes'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/items', require('./routes/itemRoutes'))
app.use('/transactions', require('./routes/transactionRoutes'))
app.use('/register', require('./routes/registerRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/cart', require('./routes/cartRoutes'))
app.use('/refresh', require('./routes/refreshRoutes'))
// app.use('/create-checkout-session', require('./routes/cartRoutes'))

app.use(verifyJWT);


    app.all('*', (req, res)=> { 
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
