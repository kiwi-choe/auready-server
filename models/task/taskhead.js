const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    id: String,             // generated in Client
    modifiedTime: Number,   // == createdTime
    description: String,
    completed: Boolean,
    order: Number
}, {
    _id: false
});

const memberSchema = mongoose.Schema({
    id: String,     // generated in Client
    userId: String,
    name: String,
    email: String,
    tasks: [taskSchema]
}, {
    _id: false
});

const orderOfTaskHeadSchema = mongoose.Schema({
    userId: String,
    orderNum: Number
}, {
    _id: false
});

const taskHeadSchema = mongoose.Schema({
    id: String,         // generated in Client
    title: String,
    color: Number,
    modifiedTime: Number,    // == createdTime
    orders: [orderOfTaskHeadSchema],
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