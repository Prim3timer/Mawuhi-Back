const Item = require('../models/Item')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const {format} = require('date-fns')
const { json } = require('express')
const express = require('express')
const app = express()
// Rhinohorn1#
const stripe =  require('stripe')(process.env.STRIPE_PRIVATE_KEY)
// const stripe =  require('stripe')(process.env.STRIPE_PUBLISHABLE_KEY)


const makePayment = async (req, res) => {
console.log({reqBody: req.body})
const fromFront = req.body
    // for the receipt generation, i'll need the:
    // id, transQty, price from each item and   
    // finally, the grandTotal
const userId = fromFront.shift()
// console.log({userId})

// console.log({requestBody: req.body})
const grandTotal = fromFront.reduce((accummulator, item)=>{
    return  accummulator + item.total
}, 0)

const itemDets = req.body.map((item)=> {
    const {total, transQty, id} = item
    return {transQty, id}
})



console.log({grandTotal})


try {
    const storeItems = await Item.find()
    // const userId = userId
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        
        line_items: req.body.map((item)=> {
            console.log({item})
            const storeItem = storeItems.find((things) => things._id == item.id)
            const dynQty = item.unitMeasure === 'Kilogram (Kg)'  || item.unitMeasure === 'Kilowatthour (KWh)' || item.unitMeasure === 'Kilowatt (KW)' ? (item.transQty * 1000) : item.unitMeasure === 'Litre (L)' ? (item.transQty * 100) : item.transQty
            
            console.log({transQty: dynQty})
            console.log({unitMeasure: item.unitMeasure})
            return {
                price_data:{ 
                    currency: 'ngn',
                    product_data: {
                        name: storeItem.name
                    },
                    unit_amount: item.unitMeasure === 'Kilogram (Kg)' || item.unitMeasure === 'Kilowatthour (KWh)' || item.unitMeasure === 'Kilowatt (KW)' ? (storeItem.price * 100) / 1000 :  item.unitMeasure === 'Litre (L)' ? (storeItem.price * 100) / 100 :  storeItem.price * 100
                },
                
                quantity: dynQty,
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
                    userId,
                    grandTotal: JSON.stringify(grandTotal * 100)                
                }
                
            })  
            res.status(200).json({session, userId})
        } catch (error) {
            res.status(500).json({error: error.message})
        }finally{
            
        }
        
    }
    
    const thanksAlert = asyncHandler(async (req, res)=> {
  const {sessionId} = req.params 
  console.log({sessionId})
  console.log({requestBody: req.body.date})
  
  const sessions = await stripe.checkout.sessions.retrieve(sessionId, {expand: ['payment_intent.payment_method']})
  const sessions2 = await stripe.checkout.sessions.retrieve(sessionId)
  // console.log({invoice: JSON.parse(sessions2.metadata.itemDets)})
  // console.log({metadata: sessions2.metadata})
  const userId = sessions2.metadata.userId
  console.log({userId})
  console.log({reqQuery: req.query})
    const determinant = sessionId
    console.log({determinant})
    const sessionsArray = []
    sessionsArray.push(determinant)
//    await  User.findOneAndUpdate({_id: userId},
//     {sessionIds: sessionsArray}
//    )

//   const result = Promise.all([
//         stripe.checkout.sessions.retrieve(sessionId, {expand: ['payment_intent.payment_method']}),
//         stripe.checkout.sessions.listLineItems(sessionId)
//   ])

//    console.log(JSON.stringify(await result)) 
const lineItems = await  stripe.checkout.sessions.listLineItems(sessionId)
console.log({data: lineItems.data})
// neededProps are unit_amount(price), description(name), quantity, sub total
const cartItems = await Item.find()
// console.log({cartItems})


const neededProps = lineItems.data.map((item)=> {
    const {amount_subtotal, amount_total, price, quantity,  description} = item
    const {unit_amount} = price
    const prod = cartItems.find((cartItem) => cartItem.name === description)
    const dynamicQty = prod.unitMeasure === 'Kilogram (Kg)' || prod.unitMeasure === 'Kilowatthour (KWh)' 
                    || prod.unitMeasure === 'Kilowatt (KW)' ? quantity / 1000 : prod.unitMeasure === 'Litre (L)' ?
                    quantity / 100 : quantity
    
    const dynamicTotal = prod.unitMeasure === 'Kilogram (Kg)' || prod.unitMeasure === 'Kilowatthour (KWh)' 
                    || prod.unitMeasure === 'Kilowatt (KW)' ? amount_subtotal / 1000 : prod.unitMeasure === 'Litre (L)' ?
                    amount_subtotal / 100 : amount_subtotal
                if (prod){

                    return {total: dynamicTotal, price: unit_amount, qty: dynamicQty, name: description}
                }

  })


if (lineItems){
    const currentQty = lineItems.data.map(async (item)=> {
        cartItems.map(async (prod) => {
            if (item.description === prod.name){
                const dynamicQty = prod.unitMeasure === 'Kilogram (Kg)' || prod.unitMeasure === 'Kilowatthour (KWh)' 
                        || prod.unitMeasure === 'Kilowatt (KW)' ? item.quantity / 1000 : prod.unitMeasure === 'Litre (L)' ?
                        item.quantity / 100 : item.quantity
               await Item.updateOne({name: item.description},
                    {qty: prod.qty - dynamicQty, 
                        date: req.body.date
                    }
                )
                return
            } else return
        })  
       
        
    })
    const receiptArray = neededProps.map((prop)=> {
        const currentItem = cartItems.find((cartItem) => cartItem.name === prop.name)
        if (currentItem){
            return {...prop, unitMeasure: currentItem.unitMeasure}
        }
    })

    console.log({receiptArray})

    const grandT = receiptArray.reduce((accummulator, total) => {
        return accummulator + total.total
    }, 0)

    console.log({grandT})

    // console.log({cartItems})
  const currentUser = await User.findById(userId)
  console.log({currentUser})
// const grandTotal = sessions2.metadata.grandTotal
// prod.unitMeasure === 'Kilogram (Kg)' || prod.unitMeasure === 'Kilowatthour (KWh)' 
//                     || prod.unitMeasure === 'Kilowatt (KW)' ? quantity / 1000 : prod.unitMeasure === 'Litre (L)' ?
//                     quantity / 100 : quantity

  const completed = false
      const transactionObject = {
          cashier: currentUser.username,
          cashierID: currentUser._id,
          goods: receiptArray,
          completed,
          date: req.body.date, 
          grandTotal: grandT
      }
      const transaction = await Transaction.create(transactionObject)
      
        if (transaction) { //created 
        res.status(201).json({ message: `New transaction created`})
    } else {
        res.status(400).json({ message: 'Invalid transaction data received' })
    }
    await User.findOneAndUpdate({_id: currentUser._id},
        {cart: []}
    )
}

})


const getSessionId = asyncHandler(async (req, res) => {
   const {sessionId} = req.params
   console.log({sessionId})
     const sessions2 = await stripe.checkout.sessions.retrieve(sessionId)
    const responseSession = await User.find().exec()
    console.log({responseSession})

     const userId = sessions2.metadata.userId

   const response = await  User.findOneAndUpdate({_id: userId},
    {sessionId})
    res.json(response.sessionId)

})

module.exports = {makePayment, thanksAlert, getSessionId
}