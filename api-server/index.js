const passport = require('passport');

const localAccountRouter = require('./api/local-account');
const socialAccountRouter = require('./api/social-account');
const userRouter = require('./api/user');
const relationshipRouter = require('./api/relationship');
const taskheadRouter = require('./api/taskhead');
const taskRouter = require('./api/task');

const oauth2Server = require(__appbase_dirname + '/auth-server/server');

exports.initialize = (app) => {

    // Set API routes
    // enter into router, when start the path, ex.'/social-account/*'
    app.use('/local-account', localAccountRouter);
    app.use('/social-account', socialAccountRouter);

    // request resources with accessToken of auready-server
    app.use('/user',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        userRouter);
    app.use('/relationship',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        relationshipRouter);
    app.use('/taskhead',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        taskheadRouter);
    app.use('/task',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        taskRouter);
};