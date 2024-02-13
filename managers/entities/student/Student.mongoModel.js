const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    username: { type: String, required: true, unique:true },
    classroom: { type: String }
   
}); 

// Create and export the model
module.exports = mongoose.model('Student', studentSchema);
