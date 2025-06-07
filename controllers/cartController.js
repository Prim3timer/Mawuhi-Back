const Item = require('../models/Item')
const Transaction = require('../models/Transaction')

const makePayment = async (req, res) => {
    // console.log(req.body)
    
    const stripe =  require('stripe')(process.env.STRIPE_PRIVATE_KEY)
    try {
        const storeItems = await Item.find()
        const receipt = req.body.pop()

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
            
            
            
            success_url: `${process.env.CLIENT_URL}/transactions`,
            cancel_url:`${process.env.CLIENT_URL}/shopping`
            
        })
        // const currentInventory = await Item.findOneAndUpdate({
        //          _id: receipt._id}, 
        //            {
        //           name: req.body.name,
        //           qty: req.body.qty,
        //           date:  format(now, 'dd/MM/yyyy\tHH:mm:ss')
              
        //       }, {new: true})
        // const storeItem = storeItems.find((things) => things._id == item.id)

        // const response = await Transaction.create(receipt)
        
        // const response = Item.findById({_id})
        res.json(session.url)
    } catch (error) {
        res.status(500).json({error: error.message})
    }

}

const addToCart = async () => {
    const cartItem = {
        name: req.body.name,
        price: req.body.price,
        qty: req.body.qty
        
    }
}

module.exports = {makePayment}