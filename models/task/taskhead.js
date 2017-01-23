const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    order: Number,
    modifiedTime: Number,    // == createdTime
    description: String,
    detailNote: String,
    completed: Boolean
});

const memberSchema = mongoose.Schema({
    name: String,
    email: String,
    tasks: [taskSchema]
});

const taskHeadSchema = mongoose.Schema({
    title: String,
    order: [{           // Map type
        member: String, // key
        order: Number   // value
    }],
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