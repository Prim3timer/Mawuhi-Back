const Item = require('../models/Item')
require('dotenv').config()
const asyncHandler = require('express-async-handler')

const makePayment = async (req, res) => {
    // console.log(req.body)
    
    const stripe =  require('stripe')(process.env.STRIPE_PRIVATE_KEY)
    try {
        const storeItems = await Item.find()
//         const items = req.body.map((item) => {
//             const storeItem = storeItems.find((things) => things._id == item.id)
//             return storeItem
//         })
// console.log(items)
//             res.json(items)
            console.log(storeItems)
// console.log(req.body)
//   res.json(items)
            // const storeItem = storeItems.find((item) => item._id == item.id)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.map((item)=> {
                const storeItem = storeItems.find((things) => things._id == item.id)
                
                console.log(storeItem)
                return {
                    price_data:{ 
                        currency: 'usd',
                    product_data: {
                        name: storeItem.name
                    },
                    unit_amount: storeItem.price
                },
                quantity: item.quantity
                }

            }),
            success_url: `${process.env.CLIENT_URL}/transaction`,
            cancel_url:`${process.env.CLIENT_URL}/shopping`

        })
        res.json(session.url)
        
        
            // res.json(items)
    } catch (error) {
        res.status(500).json({error: error.message})
    }

}

module.exports = {makePayment}