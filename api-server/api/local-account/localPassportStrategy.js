const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../../../models/user');

exports.setup = () => {

  passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        console.log('localSignup strategy');
        if (email) {
            email = email.toLowerCase();
        }

        // Validate email and password
        User.findOne({'local.email': email},
            (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user) {
                    console.log('WARNING! an user with email exists');
                    return done(null, false, {reason: 'registered email'});
                }

                let newUser = new User();
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.save((err) => {
                    if (err) throw err;
                    return done(null, newUser);
                });
            });
    }));

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
        User.findOne({'local.email': email}, (err, user) => {
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