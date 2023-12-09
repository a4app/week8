const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    // city: {
    //     type: String,
    //     required: true,
    // },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
});

const VehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
});

const BookingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    vehicle_id: {
        type: String,
        required: true,
    },
    user_name: {
        type: String,
        required: true,
    },
    vehicle_name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    booking_status: {
        type: String,
        required: true,
    },
    payment_status: {
        type: String,
        required: true,
    },
    payment_intent: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", UserSchema, 'users');
const Admins = mongoose.model("Admins", AdminSchema, 'admins');
const Vehicle = mongoose.model("Vehicle", VehicleSchema, 'vehicles');
const Booking = mongoose.model("Booking", BookingSchema, 'booking');

module.exports = {admins: Admins , user: User, vehicle: Vehicle, booking: Booking};