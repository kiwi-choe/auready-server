const oauth2orize = require('oauth2orize');

// requires databases
let OauthClient = require('../models/oauthClient');

let server = null;
const initialize = () => {
    // Create a server for oauth2 provider
    if (server) {
        console.log('auth server was already initialized.');
        return;
    }
    server = oauth2orize.createServer();

    // serialization & deserialization
    server.serializeClient((client, done) => {
        done(null, client.clientId);
    });
    server.deserializeClient((id, done) => {
        OauthClient.findOne({
            'clientId': id
        }, (err, client) => {
            if(err) {
                return done(err);
            }
            return done(null, client);
        });
    });

    // set exchange token
    require('./util/exchangeToken')(server);
};

const token = () => {
    return [error(), server.token(), server.errorHandler()];
};

const error = () => {
    return (err, req, res, next) => {
        if(err) {
            server.errorHandler()(err, req, res);
        }
    };
};

module.exports = {
    initialize: initialize,
    token: token,
    error: error
}