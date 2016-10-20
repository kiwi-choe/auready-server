const passportStrategy = require('./util/passportStrategy');
const authServer = require('./server');

const passport = require('passport');
const oauth2Server = require('./server');


exports.initialize = (app) => {
    // Start oauth2 server
    authServer.initialize();

    // Add signup client info
    require('./util/authLocalClient')();

    // Set PassportStrategy
    passportStrategy.setup();

    // Set routes for auth
    app.use('/auth/token', require('./auth.controller'));
};

