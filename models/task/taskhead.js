const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    // order: Number,       // extending function
    modifiedTime: Number,   // == createdTime
    description: String,
    detailNote: String,
    completed: Boolean
});

const memberSchema = mongoose.Schema({
    id: String,     // generated in Clinet
    name: String,
    email: String,
    tasks: [taskSchema]
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

module.exports = mongoose.model('TaskHeadDBController', taskHeadSchema);