const mongoose = require('mongoose');

const schema = mongoose.Schema({
    title: String,
    members: [String],
    order: Number,
    createdTime: Number    // == modifiedTime
});

// schema.pre('save', (next) => {
//     if (!this.isNew) {
//         return next();
//     }
//     this.createdTime = Date.now();
//     next();
// });

module.exports = mongoose.model('TaskHead', schema);