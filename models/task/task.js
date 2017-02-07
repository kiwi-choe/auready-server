const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,     // foreign key
    // order: Number,       // extending function
    modifiedTime: Number,   // == createdTime
    description: String,
    detailNote: String,
    completed: Boolean
});

module.exports = mongoose.model('Task', taskSchema);