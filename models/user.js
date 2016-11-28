const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

/*
* social-account case
* {password: social's token}
* */
const schema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    friendCount: Number
});

// schema.pre('save', next => {
//     if(!this.isNew) {
//         return next();
//     }
//     this.friendCount = 0;
//     next();
// });

// checking if password is valid
schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', schema);