const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../../../models/user');

const localSignupStrategy = () => {

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        console.log('localSignup strategy');
        if (email) {
            email = email.toLowerCase();
        }

        if (req.user && req.user.signup && req.user.signup.email) {
            // in case of invalid access, just return current data
            return done(null, req.user);
        }

        // Validate email and password
        // If success to signup-account,
        // try to login rightly => req.login()  // passport method
    }));
};

const localLoginStrategy = () => {

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        console.log('local login strategy');
        if (email) {
            email = email.toLowerCase();
        }

        // Validate email and password
        User.findOne({ 'local.email': email }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, { reason: 'invalid-email' });
            }

            if (!user.validPassword(password)) {
                return done(null, false, { reason: 'invalid-password' });
            }

            // return the logged in user
            return done(null, user);
        });
    }));
};

module.exports = {
    setLocalSignup: localSignupStrategy,
    setLocalLogin: localLoginStrategy
}