const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolSchema = new Schema({
    name: { type: String, required: true},
    location: { type: String, required: true},
    classrooms: [{ type: Schema.Types.ObjectId, ref: 'Classroom' }],
    admins:[{ type: Schema.Types.ObjectId, ref: 'User' }]

    
    // You can add other fields as needed
}); // Optional: Adds createdAt and updatedAt timestamps

// Create and export the model
module.exports = mongoose.model('School', schoolSchema);
