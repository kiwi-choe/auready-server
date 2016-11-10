const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const UserModel = require(__appbase_dirname + '/models/user');
const User = require(__appbase_dirname + '/models/user.controller');

exports.setup = () => {

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        console.log('entered into localSignup strategy');
        if (email) {
            email = email.toLowerCase();
        }

        // Validate email and password
        User.createLocal(req.body.name, email, password, done);
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        console.log('local login strategy');
        if (email) {
            email = email.toLowerCase();
        }
        // Validate email and password
        UserModel.findOne({'email': email}, (err, user) => {
            console.log(user);
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {reason: 'invalid-email'});
            }

            if (!user.validPassword(password)) {
                return done(null, false, {reason: 'invalid-password'});
            }

            // return the logged in user
            return done(null, user);
        });
    }));
};