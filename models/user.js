
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
const generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// checking if password is valid
schema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

const _model = mongoose.model('User', schema);
// registerLocal a user
const _registerLocal = (name, email, password, done) => {
    _model.findOne({'email': email},
        (err, user) => {
            if(err) {
                return done(err);
            }
            if(user) {
                console.log('WARNING! an user with email exists');
                return done(null, false, {reason: 'registered user'});
            }
            password = generateHash(password);
            let newUser = new _model({name, email, password});
            newUser.save((err) => {
                if(err) return done(err);
                return done(null, newUser);
            });
        });
};
// registerSocial a user if already loggedin or not
const _registerSocial = (userinfo, done) => {
    _model.findOne({'password': password},
        (err, user) => {
            if(err) {
                return done(err);
            }
            if(user) {
                console.log('this social account already exists, just pass this userinfo');
                return done(null, user);
            }
            let newUser = new _model({
                'name': userinfo.name,
                'email': userinfo.email,
                'password': userinfo.password
            });
            newUser.save((err) => {
                if(err) return done(err);
                return done(null, newUser);
            });
        });
};

// create the model for users and expose it to our app
module.exports = {
    model: _model,
    registerLocal: _registerLocal,
    registerSocial: _registerSocial
}