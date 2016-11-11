const passportStrategy = require('./util/passportStrategy');
const authServer = require('./server');

const passport = require('passport');

exports.initialize = (app) => {
    // Start oauth2 server
    authServer.initialize();

    // Add LocalAccount client info
    require('./util/authLocalClient')();

    // Set PassportStrategy
    passportStrategy.setup();

    // Set routes for auth
    app.use('/auth/token', require('./auth.controller'));
};

