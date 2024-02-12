const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    username: { type: String, required: true, unique:true }
    // You can add other fields as needed
}); // Optional: Adds createdAt and updatedAt timestamps

// Create and export the model
module.exports = mongoose.model('Student', studentSchema);
