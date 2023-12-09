const axios = require('axios');
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const Models = require('../mongo_db/models');

const app = express();
const stripe = require("stripe")('sk_test_51NyFwxSCdJB3l89XB6OWrEDfpGk0wrs73pWVXelbHwhsLJFk5CvLooS38bfXjatCrStNf7lhar8X3zaTZ5oAiAU200S18wcCnV');

// import models
const BookingModel = Models.booking;
const VehicleModel = Models.vehicle;
const UserModel = Models.user;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// create checkout session for payment
router.post("/create-checkout-session", async (req, res) => {
    const { user_id, vehicle_id, user_name, vehicle_name, price, quantity } = req.body;
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: vehicle_name,
                    },
                    unit_amount: 100 * 100,
                },
                quantity: 1
            }
        ],
        mode: "payment",

        // handle succesful payment - server side
        success_url: `http://127.0.0.1:5500/success?` +
        `user_id=${user_id}&vehicle_id=${vehicle_id}&user_name=${user_name}&` + 
        `vehicle_name=${vehicle_name}&price=${price}&quantity=${quantity}&session_id={CHECKOUT_SESSION_ID}`,

        // payment cancelled by user - handle in server side
        cancel_url: `http://127.0.0.1:5500/failed?user_id=${user_id}&vehicle_id=${vehicle_id}&user_name=${user_name}&` +
        `vehicle_name=${vehicle_name}&price=${price}`,
    });
    return res.status(200).json({ url: session.url });
});

// succesful payment
router.get('/success', async (req, res) => {
    const { user_id, vehicle_id, user_name, vehicle_name, price, quantity, session_id } = req.query;

    try {
        // retrieve payment_intent using CHECKOUT_SESSION_ID
        const session  = await stripe.checkout.sessions.retrieve(session_id);
        const paymentIntent = session.payment_intent;
        
        // add data to booking collection for succesful booking
        const book = new BookingModel({
            user_id: user_id,
            vehicle_id: vehicle_id,
            user_name: user_name,
            vehicle_name: vehicle_name,
            price: price,
            booking_status: 'completed',
            payment_status: 'succesful',
            payment_intent: paymentIntent
        })
        await book.save();

        // update vehicle qyantity ( -1 )
        await VehicleModel.findOneAndUpdate(
            { _id: new ObjectId(vehicle_id) },
            { $set: { quantity: (parseInt(quantity) - 1).toString() } },
            { new: true }
        );

        // redirect cliend side with success message
        return res.redirect(`http://127.0.0.1:3000/user/${user_id}?status=success`);
    }
    catch(err) {
        console.log(err);

        // redirect cliend side with failed message
        return res.redirect(`http://127.0.0.1:3000/user/${user_id}?status=failed`);
    }
})

// failed/cancelled payment handling
router.get('/failed', async (req, res) => {
    const { user_id, vehicle_id, user_name, vehicle_name, price } = req.query;

    // add data to bookings collection with pending status
    const book = new BookingModel({
        user_id: user_id,
        vehicle_id: vehicle_id,
        user_name: user_name,
        vehicle_name: vehicle_name,
        price: price,
        booking_status: 'pending',
        payment_status: 'failed',
        payment_intent: '?'
    })
    await book.save();

    // redirect cliend side with failed message
    return res.redirect(`http://127.0.0.1:3000/user/${user_id}?status=failed`);
})

// router.post('/single-user', async (req, res) => {
//     const { id } = req.body;
//     const user = await UserModel.findOne({_id: new ObjectId(id)});
//     res.json(user);
// })

// get all bookings data
router.post('/user-bookings', async (req, res) => {
    const { id } = req.body;
    try {
        const data = await BookingModel.find({user_id: id});
        res.json(data);
    }
    catch(err) {
        console.log(err);
        return res.json([]);
    }
})

// user operations on booking data
router.post('/user/modify-booking', async (req, res) => {
    const { operation, data } = req.body;

    try {
        // request for booking cancellation
        if(operation === 'request-cancel') {
            // change booking_status: cancel-requested
            await BookingModel.findOneAndUpdate(
                {_id: data._id}, 
                {$set: { booking_status: 'cancel-requested' }},
            )
            return res.json({status: true, operation: operation, url: ''});
        }
        // abort pending booking with failed payment
        else if(operation === 'abort') {
            // booking status to cancelled
            await BookingModel.findOneAndUpdate(
                {_id: data._id}, 
                {$set: { booking_status: 'aborted' }},
            )
            return res.json({status: true, operation: operation, url: ''});
        }
        // retry pending booking with failed payment
        else if(operation === 'retry') {
            // get vehicle details
            const vehicle = await VehicleModel.findOne({_id: data.vehicle_id});

            // call checkout session
            const resp = await axios.post('http://127.0.0.1:5500/create-checkout-session', {
                user_id: data.user_id,
                vehicle_id: data.vehicle_id,
                user_name: data.user_name,
                vehicle_name: data.vehicle_name,
                price: vehicle.price,
                quantity: vehicle.quantity,
            });

            if (resp.data.url) {
                // delete current booking data
                await BookingModel.findOneAndDelete({_id: data._id});
                return res.json({status: true, operation: operation, url: resp.data.url});
            }
        }
    }
    catch (err) {
        console.log(err);
        return res.json({status: false, operation: operation})
    }
})




module.exports = router;