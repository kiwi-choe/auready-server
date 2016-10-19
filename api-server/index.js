const passport = require('passport');
const localAccountRouter = require('./api/local-account');
const socialAccountRouter = require('./api/social-account');
const userRouter = require('./api/user');

const User = require('../models/user');

exports.initialize = (app) => {

    // setPassport();

    // Set API routes
    // enter into router, when start the path, ex.'/signup-account/*'
    app.use('/local-account', localAccountRouter);
    // app.use('/social-account', socialAccountRouter);
    // app.use('/users', userRouter);
};

const setPassport = () => {
    passport.serializeUser((user, done) => {
        console.log('Serialization: '+user);
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};