const mongoose = require('mongoose');

const schema = mongoose.Schema({
    userOneId: String,
    userTwoId: String,
    status: Number,
    actionUserId: String
});

const PENDING = 0;
schema.pre('save', next => {
    if(!this.isNew) {
        return next();
    }
    this.status = PENDING;
    next();
});
module.exports = mongoose.model('Relationship', schema);