const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    // You can add other fields as needed
}); // Optional: Adds createdAt and updatedAt timestamps

// Create and export the User model
module.exports = mongoose.model('User', userSchema);
