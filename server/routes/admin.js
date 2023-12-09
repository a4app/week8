const fs = require('fs');
const express = require('express');
const Models = require('../mongo_db/models.js');
const { ObjectId } = require('mongodb');

const stripe = require("stripe")('sk_test_51NyFwxSCdJB3l89XB6OWrEDfpGk0wrs73pWVXelbHwhsLJFk5CvLooS38bfXjatCrStNf7lhar8X3zaTZ5oAiAU200S18wcCnV');

const multer = require('multer');

// storage configuration
const storage = multer.diskStorage({
    destination: 'images',
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
// multer instance
const upload = multer({ storage: storage });

const router = express.Router();

// import models
const VehicleModel = Models.vehicle
const BookingModel = Models.booking;
const AdminModel = Models.admins;
const UserModel = Models.user;

// get all vehicles details
router.get('/vehicles', async (req, res) => {
    const vehicles = await VehicleModel.find();
    return res.send(vehicles);
})

// add new vehicle to vehicles collection
router.post('/add-vehicle', upload.single('image'), async (req, res) => {
    const { name, desc, price, quantity } = req.body;

    // responce data model
    const out = {status: true, error: false, n: '', d: '', p: '', q: '', i: ''}

    // check if any of the input is empty
    if(!name || !desc || !price || !quantity || !req.file) {

        out.status = false;

        if(!name) out.n = 'required *';
        else out.n = '';

        if(!desc) out.d = 'required *';
        else out.d = '';

        if(!price) out.p = 'required *';
        else if(isNaN(price)) out.p = 'invalid !';
        else out.p = '';

        if(!quantity) out.q = 'required *';
        else if(isNaN(quantity)) out.q = 'invalid !';
        else out.q = '';

        if(!req.file) out.i = 'required *';
        else out.i = '';

        res.json(out);
    }
    // all fields are non-empty
    else {
        out.status = true;
        try {
            // add data to vehicles collection
            const newVehicle = new VehicleModel({ 
                name: name, 
                desc: desc, 
                price: price, 
                quantity: quantity, 
                image: {
                    data: fs.readFileSync('./images/' + req.file.originalname),
                    contentType: req.file.mimetype,
                }
            })
            await newVehicle.save();
            return res.send(out);
        }
        catch(err) {
            out.status = false;
            out.error = true;
            console.log(err);
            return res.send(out);
        }
    }
})

// delete existing vehicle in vehicles collection
router.post('/delete-vehicle', async (req, res) => {
    const { id } = req.body;
    try {
        // find one and delete
        const deletedUser = await VehicleModel.findOneAndDelete({ _id: id });

        (deletedUser) ? 
        res.json({ status: true, error: false}) : 
        res.json({ status: false, error: false}) ;
    }
    catch(error) {
        // responce with error flag true
        console.error('Error deleting user:', error);
        return res.json({ status: false, error: true})
    }
})

// update existing vehicle details
router.post('/update-vehicle', upload.single('image'), async (req, res) => {
    const { id, name, desc, price, quantity } = req.body;

    // responce model
    const out = {status: true, error: false, n: '', d: '', p: '', q: '', i: ''}

    // check if any file is empty
    if(!name || !desc || !price || !quantity || !req.file) {

        out.status = false;

        if(!name) out.n = 'required *';
        else out.n = '';

        if(!desc) out.d = 'required *';
        else out.d = '';

        if(!price) out.p = 'required *';
        else if(isNaN(price)) out.p = 'invalid !';
        else out.p = '';

        if(!quantity) out.q = 'required *';
        else if(isNaN(quantity)) out.q = 'invalid !';
        else out.q = '';

        if(!req.file) out.i = 'required *';
        else out.i = '';

        return res.json(out);
    }
    // all non-empty fields
    else {
        try {
            // update and get updated data
            const updatedVehicle = await VehicleModel.findOneAndUpdate(
                { _id: id },
                { $set: { id: id, name: name, desc: desc, price: price, quantity: quantity, image: {
                    data: fs.readFileSync('./images/' + req.file.originalname),
                    contentType: req.file.mimetype,
                } } },
                { new: true }
            );
    
            // succesfully updated
            if(updatedVehicle) {
                out.status = true;
                return res.json(out)
            }
            // updating failed
            else {
                out.status = false;
                return res.json(out)
            }
        }
        catch(error) {
            // responce with error flag true
            out.error = true;
            console.error('Error updating vehicle:', error);
            return res.json(out)
        }
    }
})

// get data in booking collection
router.get('/admin-booking', async (req, res) => {
    try {
        const data = await BookingModel.find();
        // return data
        return res.json(data);
    }
    catch(err) {
        // return empty list
        console.log(err);
        return res.json([]);
    }
})

// edit profile picture of admin
router.post('/edit-profile', upload.single('image'), async (req, res) => {
    const { id } = req.body;
    try {
        const updatedData = await AdminModel.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { image: {
                data: fs.readFileSync('./images/' + req.file.originalname),
                contentType: req.file.mimetype,
            }, } },
            { new: true }
        );

        // succesfull updation
        if(updatedData) {
            // update session data
            req.session.login = { auth: 'admin', id: updatedData._id, username: updatedData.username, image: updatedData.image };
            // return updated document of admin
            return res.send(updatedData)
        }
        // updation failed
        else {
            return res.send(false);
        }
    }
    catch(err) {
        console.log(err);
        return res.send(false);
    }
})

// get data of all customers
router.get('/customers', async (req, res) => {
    try {
        const users = await UserModel.find();
        return res.send(users);
    }
    catch(err) {
        // return empty list
        return res.send([]);
    }
})

// operations for admin in bookings data
router.post('/admin/modify-booking', async (req, res) => {
    const { operation, data } = req.body;
    try {
        // accept a cancellation request from user
        if(operation === 'accept') {
            // refund payment
            await stripe.refunds.create({
                payment_intent: data.payment_intent,
            });
    
            // update vehicle quantity
            const vehicle = await VehicleModel.findOne({_id: data.vehicle_id});
            await VehicleModel.findOneAndUpdate(
                {_id: data.vehicle_id}, {$set: {quantity: (parseInt(vehicle.quantity) + 1).toString() }}
            )
            
            // change payment_status: refunt-completed, booking_status: cancelled
            await BookingModel.findOneAndUpdate(
                {_id: data._id}, {$set: {payment_status: 'refund-completed', booking_status: 'cancelled' }}
            )
            return res.json({status: true, operation: operation})
        }
        // decline cancellation request from user
        else if(operation === 'decline') {
            // change booking status to completed
            await BookingModel.findOneAndUpdate(
                {_id: data._id}, {$set: { booking_status: 'completed' }}
            )
            return res.json({status: true, operation: operation})
        }
        // reject a completed booking of user
        else if(operation === 'reject') {
            // refund payment
            const refund = await stripe.refunds.create({
                payment_intent: data.payment_intent,
            });
            console.log(refund);
    
            // update vehicle quantity
            const vehicle = await VehicleModel.findOne({_id: data.vehicle_id});
            await VehicleModel.findOneAndUpdate(
                {_id: data.vehicle_id}, {$set: {quantity: (parseInt(vehicle.quantity) + 1).toString() }}
            )
            
            // change payment_status: refunt-completed, booking_status: cancelled
            await BookingModel.findOneAndUpdate(
                {_id: data._id}, {$set: {payment_status: 'refund-completed', booking_status: 'rejected' }}
            )
            return res.json({status: true, operation: operation})
        }
    }
    catch(err) {
        console.log(err);
        res.json({status: false, operation: operation});
    }
})

module.exports = router;