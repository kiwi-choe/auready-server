const mongoose = require('mongoose');

const schema = mongoose.Schema({
    taskHeadId: String,
    members: [String],
    order: Number,
    createdTime: Number,    // == modifiedTime
    description: String,
    detailNote: String,
    completed: [{
        member: String,
        completed: Number
    }]
});

schema.pre('save', (next) => {
    if (!this.isNew) {
        return next();
    }
    this.createdTime = Date.now();
    next();
});

module.exports = mongoose.model('Task', schema);
