const passportStrategy = require('./passportStrategy');

const authServer = require('./server');

exports.initialize = (app) => {
    // Start oauth2 server
    authServer.initialize();

    // Add signup client info
    require('./authLocalClient')();

    // Set PassportStrategy
    passportStrategy.setBasic();
    passportStrategy.setBearer();

    // Set routes for auth
    app.use('/auth/token', require('./auth.controller'));
}

