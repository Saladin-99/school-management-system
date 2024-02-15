const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema({
    name: { type: String, required: true, unique: true },
    vacancy: { type: Number, required: true },
    school: {type:String, required: true},
    students: [{ type: Schema.Types.ObjectId, ref: 'Student'}],
    // You can add other fields as needed
}); // Optional: Adds createdAt and updatedAt timestamps

// Create and export the model
module.exports = mongoose.model('Classroom', classroomSchema);
