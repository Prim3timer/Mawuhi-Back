const Item = require('../models/Item')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { format } = require('date-fns')
const { json } = require('express')
const express = require('express')
const app = express()
// Rhinohorn1#
// const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
// const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const stripe = require('stripe')(process.env.STRIPE_REAL_LIVE_KEY)


const makePayment = async (req, res) => {
    console.log({ reqBody: req.body })
    const fromFront = req.body
    // for the receipt generation, i'll need the:
    // id, transQty, price from each item and   
    // finally, the grandTotal
    const userId = fromFront.shift()
    // console.log({requestBody: req.body})
    const grandTotal = fromFront.reduce((accummulator, item) => {
        return accummulator + item.total
    }, 0)


    try {
        const storeItems = await Item.find()
        // const userId = userId
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',

            line_items: req.body.map((item) => {
                console.log({ item })
                const storeItem = storeItems.find((things) => things._id == item.id)
                const dynQty = item.unitMeasure === 'Kilogram (kg)' || item.unitMeasure === 'Kilowatthour (kWh)' || item.unitMeasure === 'Kilowatt (kW)' || item.unitMeasure === 'Litre (L)' || item.unitMeasure === 'Pound (lbs)' ? (item.transQty * 1000) : item.transQty

                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: item.unitMeasure === 'Kilogram (kg)' || item.unitMeasure === 'Kilowatthour (kWh)' || item.unitMeasure === 'Kilowatt (kW)' || item.unitMeasure === 'Pound (lbs)' || item.unitMeasure === 'Litre (L)' ? (storeItem.price * 100) / 1000 : storeItem.price * 100
                        // unit_amount: storeItem.price * 100
                    },

                    quantity: dynQty,
                }

            }),
            shipping_address_collection: {
                allowed_countries: ['US', 'NG']
            },

            success_url: `${process.env.CLIENT_URL}/#/cart/thanks?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/shopping`,

            metadata: {
                userId,
                grandTotal: JSON.stringify(grandTotal * 100)
            }

        })
        res.status(200).json({ session, userId })
    } catch (error) {
        res.status(500).json({ error: error.message })
    } finally {

    }

}

const thanksAlert = asyncHandler(async (req, res) => {
    const { sessionId } = req.params
    console.log({ sessionId })
    console.log({ requestBody: req.body.date })

    const sessions = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent.payment_method'] })
    const sessions2 = await stripe.checkout.sessions.retrieve(sessionId)

    const userId = sessions2.metadata.userId
    console.log({ userId })
    console.log({ reqQuery: req.query })
    const determinant = sessionId
    console.log({ determinant })
    const sessionsArray = []
    sessionsArray.push(determinant)

    //   const result = Promise.all([
    //         stripe.checkout.sessions.retrieve(sessionId, {expand: ['payment_intent.payment_method']}),
    //         stripe.checkout.sessions.listLineItems(sessionId)
    //   ])
    // const addressColletor = sessions2.collected_information.shipping_details.address
    const { payment_intent } = sessions
    const { collected_information } = sessions2
    const address = collected_information ? collected_information.shipping_details.address : ''
    const name = collected_information ? collected_information.shipping_details.name : ''
    const email = payment_intent ? payment_intent.payment_method.billing_details.email : ''

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)
    console.log({ name: sessions.payment_intent.payment_method.billing_details.email })
    // neededProps properties are unit_amount(price), description(name), quantity, sub total
    const cartItems = await Item.find()


    const neededProps = lineItems.data.map((item) => {
        const { amount_subtotal, amount_total, price, quantity, description } = item
        const { unit_amount } = price

        const prod = cartItems.find((cartItem) => cartItem.name === description)
        // multiplying certain qty by 1000 depending on the object's uint measure to circumvent the decimal issue with stripe quantity
        const dynamicQty = prod.unitMeasure === 'Kilogram (kg)' || prod.unitMeasure === 'Kilowatthour (kWh)'
            || prod.unitMeasure === 'Kilowatt (kW)' || prod.unitMeasure === 'Pound (lbs)' || prod.unitMeasure === 'Litre (L)' ? quantity / 1000 : quantity

        const dynamicPrice = prod.unitMeasure === 'Kilogram (kg)' || prod.unitMeasure === 'Kilowatthour (kWh)'
            || prod.unitMeasure === 'Kilowatt (kW)' || prod.unitMeasure === 'Pound (lbs)' || prod.unitMeasure === 'Litre (L)' ? unit_amount * 10 : unit_amount / 100
        const adjustedSubtotal = amount_subtotal / 100
        if (prod) {
            return { total: adjustedSubtotal, price: dynamicPrice, qty: dynamicQty, name: description }
        }

    })


    if (lineItems) {
        const currentQty = lineItems.data.map(async (item) => {
            cartItems.map(async (prod) => {
                if (item.description === prod.name) {
                    const dynamicQty = prod.unitMeasure === 'Kilogram (kg)' || prod.unitMeasure === 'Kilowatthour (kWh)'
                        || prod.unitMeasure === 'Kilowatt (kW)' || prod.unitMeasure === 'Litre (L)' || prod.unitMeasure === 'Pound (lbs)' ? item.quantity / 1000
                        : item.quantity
                    await Item.updateOne({ name: item.description },
                        {
                            qty: prod.qty - dynamicQty,
                            date: req.body.date
                        }
                    )
                    return
                } else return
            })


        })
        const receiptArray = neededProps.map((prop) => {
            const currentItem = cartItems.find((cartItem) => cartItem.name === prop.name)
            if (currentItem) {
                return { ...prop, unitMeasure: currentItem.unitMeasure }
            }
        })

        const grandT = receiptArray.reduce((accummulator, total) => {
            return accummulator + total.total
        }, 0)
        const currentUser = await User.findById(userId)

        const transactionObject = {
            cashier: currentUser.username,
            cashierID: currentUser._id,
            goods: receiptArray,
            date: req.body.date,
            grandTotal: grandT,
            last4: sessions.payment_intent.payment_method.card.last4,
            address,
            name,
            email
        }
        const transaction = await Transaction.create(transactionObject)

        if (transaction) { //created 
            res.status(201).json({ message: `transaction complete`, transaction })
        } else {
            res.status(400).json({ message: 'Invalid transaction data received' })
        }
        await User.findOneAndUpdate({ _id: currentUser._id },
            { cart: [] }
        )
    }

})

// for making sure a transaction is not dublicated as it results in double intventory update.
const getSessionId = asyncHandler(async (req, res) => {
    const { sessionId } = req.params
    console.log({ sessionId })
    const sessions2 = await stripe.checkout.sessions.retrieve(sessionId)
    const userId = sessions2.metadata.userId
    // change the session with the lates one.
    const response = await User.findOneAndUpdate({ _id: userId },
        { sessionId })
    res.json(response.sessionId)
})


const checkLink = () => {
    console.log('checking link')
}



module.exports = {
    makePayment, thanksAlert, getSessionId, checkLink
}