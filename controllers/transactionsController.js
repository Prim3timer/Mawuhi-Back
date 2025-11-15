const Transaction = require('../models/Transaction')
const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')
const {format} = require('date-fns')
const stripe =  require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const getAllTransactions = asyncHandler(async (req, res)=> {
    const transactions = await Transaction.find()
    if (!transactions?.length){
        return res.status(400).json({message: 'no transactions found'})
    }
   res.json(transactions)
})

const getSales = asyncHandler(async (req, res)=> {
    const transactions = await Transaction.find()
    if (!transactions?.length){
        return res.status(400).json({message: 'no transactions found'})
    }
  res.json(transactions)
})


const createNewTransaction = asyncHandler(async (req, res) => {
    var {cashier, cashierID, goods, date,completed, grandTotal} = req.body


    // Confirm data
    if (!goods) {
        return res.status(400).json({ message: 'All fields are required' })
    }



    // if (duplicate) {
    //     return res.status(409).json({ message: 'Duplicate item' })
    // }
    // const currentDay = new Date()

    // const formatedDate = format(currentDay, 'yyyy MM dd\tHH:mm:ss')
    // date = formatedDate
    const transactionObject = {
        cashier,
        cashierID,
        goods,
        completed,
        date, 
        grandTotal: grandTotal
    }

    // Create and store new item 
    const transaction = await Transaction.create(transactionObject)

    if (transaction) { //created 
        res.status(201).json({ message: `New transaction created` })
    } else {
        res.status(400).json({ message: 'Invalid transaction data received' })
    }
})



const makePayment = async (req, res) => {
console.log({reqBody: req.body})
const theArray = req.body.goods
// console.log({theArray})  
// for the receipt generation, i'll need the:
// id, transQty, price from each item and
// finally, the grandTotal


    try {
        const storeItems = await Item.find()
       const userId = req.body.cashierID
    console.log({line_items: theArray.map((item)=> {
        const {total, qty, _id} = item
        return {total, qty, _id}
    })})
    

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
    
            line_items: req.body.goods.map((item)=> {
                const storeItem = storeItems.find((things) => things._id == item._id)
                // console.log({storeItem})
                 const dynQty = item.unitMeasure === 'Kilogram (Kg)'  || item.unitMeasure === 'Kilowatthour (KWh)' || item.unitMeasure === 'Kilowatt (KW)' ? (item.transQty * 1000) : item.unitMeasure === 'Litre (L)'  || item.unitMeasure === 'Pound (lbs)' ? (item.transQty * 1000) : item.transQty
              
                return {
                    price_data:{ 
                        currency: 'ngn',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: item.unitMeasure === 'Kilogram (Kg)' || item.unitMeasure === 'Kilowatthour (KWh)' || item.unitMeasure === 'Kilowatt (KW)'  || item.unitMeasure === 'Pound (lbs)' || item.unitMeasure === 'Litre (L)' ? (storeItem.price * 100) / 1000 :   storeItem.price * 100
                    },
                    quantity: dynQty
                }
                
            }),
            // shipping_address_collection: {
            //     allowed_countries: ['US', 'NG']
            // },
            // customer: [
            //     req.body[0].userId
            // ],
                    
            success_url: `${process.env.CLIENT_URL}/transactions?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${process.env.CLIENT_URL}/shopping`,
            
              metadata: {
                userId,
                grandTotal: JSON.stringify(req.body.grandTotal * 100),
                cashier: req.body.cashier
            }
        })  
       
        // const {url} = session
        // console.log({session})
        res.status(200).json({session, userId})
    } catch (error) {
        res.status(500).json({message: error.message}) 
    }
    // finally{
        
    // }
    
}


const deleteTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const item = await Transaction.findById(id).exec()

    if (!item) {
        return res.status(400).json({ message: 'Transaction not found' })
    }

    const result = await item.deleteOne()

    const reply = `Transaction '${item.name}' with ID ${item._id} deleted`

    res.json(reply)
})


const checkLink = () => {
    console.log('checking link')
}




module.exports = {
    checkLink,  
    getAllTransactions,
    createNewTransaction,
    getSales,
    deleteTransaction,
    makePayment

}