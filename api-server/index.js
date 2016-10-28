const passport = require('passport');
const localAccountRouter = require('./api/local-account');
const socialAccountRouter = require('./api/social-account');
const userRouter = require('./api/user');

exports.initialize = (app) => {

    // Set API routes
    // enter into router, when start the path, ex.'/social-account/*'
    app.use('/local-account', localAccountRouter);
    app.use('/social-account', socialAccountRouter);
    // app.use('/users', userRouter);
};