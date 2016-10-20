/*
 * for Local account
 * made the clientID by myself
 * */

const mongoose = require('mongoose');
const utils = require('../utils/utils');

const schema = mongoose.Schema({
    name: String,
    clientId: String,
    clientSecret: String,
    //grantType is only 'password'
    grantType: [String, Boolean]
    // so, don't need redirectURI // redirectURI: String,
});

schema.pre('save', function (next) {
    if (!this.isNew) {
        return next();
    }
    if (!this.clientId) {
        this.clientId = utils.uid(16);
    }
    if (!this.clientSecret) {
        this.clientSecret = utils.uid(32);
    }
    next();
});

module.exports = mongoose.model('OauthClient', schema);
