const passport = require('passport');

const localAccountRouter = require('./api/local-account');
const socialAccountRouter = require('./api/social-account');
const userRouter = require('./api/user');
const relationshipRouter = require('./api/relationship');
const taskheadRouter = require('./api/taskhead');
const taskRouter = require('./api/task');
const notificationRouter = require('./api/notification');

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
    app.use('/relationships',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        relationshipRouter);
    app.use('/taskheads',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        taskheadRouter);
    app.use('/tasks',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        taskRouter);
    app.use('/notifications',
        passport.authenticate('bearer', {session: false}), oauth2Server.error(),
        notificationRouter);
};