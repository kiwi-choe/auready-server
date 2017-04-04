const mongoose = require('mongoose');

/*
* fromUserId - user who sent request
* toUserId - user who received request
* */
const PENDING = 0;
const ACCEPTED = 1;
const NO_STATUS = 2;

const schema = mongoose.Schema({
    fromUserId: String,
    toUserId: String,
    status: {
        type: Number,
        enum: [PENDING, ACCEPTED, NO_STATUS]
    }
});

schema.pre('save', next => {
    // if(!this.isNew) {
    //     console.log('entered !isNew');
    //     return next();
    // }
    this.status = PENDING;
    next();
});

module.exports = mongoose.model('Relationship', schema);