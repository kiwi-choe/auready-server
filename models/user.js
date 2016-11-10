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

// checking if password is valid
schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', schema);