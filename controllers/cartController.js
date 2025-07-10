const Item = require('../models/Item')
const Cart = require('../models/Cart')
const Transaction = require('../models/Transaction')
const asyncHandler = require('express-async-handler')
const { json } = require('express')
const express = require('express')
const app = express()
// Rhinohorn1#
const stripe =  require('stripe')(process.env.STRIPE_PRIVATE_KEY)
// const stripe =  require('stripe')(process.env.STRIPE_PUBLISHABLE_KEY)
const makePayment = async (req, res) => {
    
    try {
        const storeItems = await Item.find()
       const userId = req.body[0].userId
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
       
            line_items: req.body.map((item)=> {
                const storeItem = storeItems.find((things) => things._id == item.id)
                
              
                return {
                    price_data:{ 
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.price * 100
                    },
                    quantity: item.transQty,
                }
                
            }),
            // shipping_address_collection: {
            //     allowed_countries: ['US', 'NG']
            // },
            // customer: [
            //     req.body[0].userId
            // ],
                    
            success_url: `${process.env.CLIENT_URL}/cart/thanks?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${process.env.CLIENT_URL}/shopping`,
            metadata: {
                userId: req.body[0].userId
            }
            
        })  
       
        // const {url} = session
        // console.log({session})
        res.status(200).json({session, userId})
    } catch (error) {
        res.status(500).json({error: error.message})
    }finally{

    }
    
}

const thanksAlert = asyncHandler(async (req, res)=> {
  const {sessionId} = req.params 
 
 
        const sessions = await stripe.checkout.sessions.retrieve(sessionId, {expand: ['payment_intent.payment_method']})
const sessions2 = await stripe.checkout.sessions.retrieve(sessionId)
// console.log({customer: sessions2.metadata.userId})
const userId = sessions2.metadata.userId
//   const result = Promise.all([
//         stripe.checkout.sessions.retrieve(sessionId, {expand: ['payment_intent.payment_method']}),
//         stripe.checkout.sessions.listLineItems(sessionId)
//   ])

//    console.log(JSON.stringify(await result)) 
const lineItems = await  stripe.checkout.sessions.listLineItems(sessionId)
// console.log({lineItems: lineItems.data})


const cartItems = await Item.find()
if (lineItems){
    const currentQty = lineItems.data.map(async (item)=> {
        cartItems.map(async (prod) => {
            if (item.description === prod.name){

                await Item.updateOne({name: item.description},
                    {qty: prod.qty - item.quantity}
                )
            }
        })
        // await Cart.deleteMany({userId: sessions2.metadata.userId})
    })
}

})



const addToCart = asyncHandler(async (req, res) => {
    const cartItem = {
        userId: req.body.userId,
        name: req.body.name,
       id: req.body.id,
        quantity: req.body.quantity,
        transQty: req.body.transQty,
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




module.exports = {addToCart, getCartItems, removeItem, clearCart, makePayment, thanksAlert}