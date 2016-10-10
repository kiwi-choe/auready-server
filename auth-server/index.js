const passportStrategy = require('./passportStrategy');

const authServer = require('./server');

exports.initialize = (app) => {
    // Start oauth2 server
    authServer.initialize();

    // Add local account client info
    require('./authLocalAccount')();

    // Set PassportStrategy
    passportStrategy.PublicClient();
    passportStrategy.Bearer();

    // Set routes for auth
    app.route('/oauth2/token', require('./auth.controller')(app));
}

