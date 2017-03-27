const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    // order: Number,       // extending function
    modifiedTime: Number,   // == createdTime
    description: String,
    detailNote: String,
    completed: Boolean
}, {
    _id: false
});

const memberSchema = mongoose.Schema({
    id: String,     // generated in Client
    name: String,
    email: String,
    tasks: [taskSchema]
}, {
    _id: false
});

const taskHeadSchema = mongoose.Schema({
    id: String,         // generated in Client
    title: String,
    modifiedTime: Number,    // == createdTime
    members: [memberSchema]
});

// taskHeadSchema.pre('save', (next) => {
//     if (!this.isNew) {
//         return next();
//     }
//     this.createdTime = Date.now();
//     next();
// });

module.exports = mongoose.model('TaskHead', taskHeadSchema);