
const signupRouter = require('./api/signup');
const userRouter = require('./api/user');

exports.initialize = (app) => {
    // Set Passport

    // Set API routes
    // app.route('/signup'), signupRouter(app));
    // enter into router, when start '/users'
    // app.route('/users', userRouter(app));
    app.use('/users', userRouter);
};

