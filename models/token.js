const mongoose = require('mongoose');

const schema = mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    expiredIn: Number,
    clientId: String,
    userId: String,
    createdTime: Number
});

schema.pre('save', (next) => {
    if (!this.isNew) {
        return next();
    }
    this.createdTime = Date.now();
    next();
});

module.exports = mongoose.model('AccessToken', schema);