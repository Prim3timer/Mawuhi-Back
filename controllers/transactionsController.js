const Transaction = require('../models/Transaction')
const Item = require('../models/Item')
const asyncHandler = require('express-async-handler')
const {format} = require('date-fns')

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

// const updateTrans = asyncHandler( async(req, res) => {

//     const {cashierID} = req.body
//     const response = await Transaction.find()
//     if (response){
//         for (let i = 0; i < 44; i++){
//          const currentTrans = await Transaction.findOneAndUpdate({
//             _id: response[i]._id},
//             {cashierID},
//          {new: true})
//          await currentTrans.save()
//         }  
//     }
// })




module.exports = {
    getAllTransactions,
    createNewTransaction,
    getSales,
    deleteTransaction,
    // updateTrans
}