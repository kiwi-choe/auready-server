const mongoose = require('mongoose');

/*
* fromUserId - user who sent request
* toUserId - user who received request
* */
const PENDING = 0;
const ACCEPTED =1;
const DECLINED = 2;
const schema = mongoose.Schema({
    fromUserId: String,
    toUserId: String,
    status: {
        type: Number,
        enum: [PENDING, ACCEPTED, DECLINED]
    }
});

schema.pre('save', next => {
    // if(!this.isNew) {
    //     console.log('entered !isNew');
    //     return next();
    // }
    this.status = PENDING;
    console.log('status: ' + this.status);
    next();
});

module.exports = mongoose.model('Relationship', schema);