const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    order: Number,
    createdTime: Number,    // == modifiedTime
    description: String,
    detailNote: String,
    completed: [String]     // member name
});

const schema = mongoose.Schema({
    title: String,
    members: [String],
    order: Number,
    createdTime: Number,    // == modifiedTime
    tasks: [taskSchema]
});

// schema.pre('save', (next) => {
//     if (!this.isNew) {
//         return next();
//     }
//     this.createdTime = Date.now();
//     next();
// });

module.exports = mongoose.model('TaskHeadController', schema);