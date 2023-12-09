const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect('mongodb+srv://week8user:week8pass@cluster8.gavkspi.mongodb.net/week8database');
		console.log('Connected to MongoDB');
		return true;
	}
	catch(error) {
		console.error('Mongoose connection error:', error);
		return false;
	}
};

module.exports = connectDB