const Item = require('../models/Item')
const Cart = require('../models/Cart')
const Transaction = require('../models/Transaction')
const asyncHandler = require('express-async-handler')
const { json } = require('express')
const express = require('express')
const router = express.Router()
const app = express()
// Rhinohorn1#
const makePayment = async (req, res) => {
    // console.log(req.body)
    
    const stripe =  require('stripe')(process.env.STRIPE_PRIVATE_KEY)
    try {
        const storeItems = await Item.find()
        // console.log('store items are: ', storeItems)

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.map((item)=> {
                const storeItem = storeItems.find((things) => things._id == item.id)
                // console.log('store item is: ', storeItem)
                
              
                return {
                    price_data:{ 
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.price * 100
                    },
                    quantity: item.quantity,
                }
                
            }),
            // shipping_address_collection: {
            //     allowed_countries: ['US', 'NG']
            // },
            
            success_url: `https://mawuhi.onrender.com/transactions`,
            cancel_url:`${process.env.CLIENT_URL}/shopping`
            
        })  
       
        const {url} = session
        res.json({url})
//    console.log(session)
    } catch (error) {
        res.status(500).json({error: error.message})
    }

}

const getReceipt = (req, res ) => {
    console.log('why thank you!')
    console.log(req.query.session_id)
}

router.route('/transactions').get(getReceipt)

const addToCart = asyncHandler(async (req, res) => {
    const cartItem = {
        userId: req.body.userId,
        name: req.body.name,
       id: req.body.id,
        quantity: req.body.quantity,
        price: req.body.price,
        total: req.body.total
        
    }
    // console.log(cartItem)
    if (cartItem){
// console.log(cartItem)
        const item = await Cart.create(cartItem)
        if (item){
            res.status(201).json({message: 'item added to cart'})
        }
    }


}) 

const getCartItems = asyncHandler(async (req, res) => {
    const cartItems = await Cart.find()
    if(!cartItems){
        return json.status(400).send({message: 'no  cart items found'})
    }
    else res.json(cartItems)
})


const removeItem = asyncHandler( async (req, res) => {
    const {id} = req.params
    if (!id) res.status(400).json('item id required')

        const item = await Cart.findById(id).exec()

        if(!item) res.status(400).json('no item found')

            await item.deleteOne()
            const reply = `item romved`
            res.json(reply)
})

const clearCart = asyncHandler(async (req, res) => {
   const {id} = req.params
   const response = await Cart.deleteMany({userId: id})
   res.json(response)
   

})




module.exports = {makePayment, addToCart, getCartItems, removeItem, clearCart}