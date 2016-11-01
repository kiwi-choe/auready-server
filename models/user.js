const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

/*
* social-account case
* {password: social's token}
* */
const schema = mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// generating a hash
schema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', schema);