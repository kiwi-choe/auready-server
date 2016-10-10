const OauthClient = require('../models/oauthClient');
const predefine = require('./predefine');

// Register local client info
const trustedClientInfo = {
    name: 'localAccount',
    grantType: [
        predefine.oauth2.type.password.name,
        predefine.oauth2.type.password.token_refreshable
    ],
    clientId: 'tEYQAFiAAmLrS2Dl'
};

module.exports = () => {
    // Add trust client(1st app) as 'password' grant type
    OauthClient.findOne({
        'name': trustedClientInfo.name
    }, (err, trustedClient) => {
        if(err) {
            throw new Error();
        }
        if(trustedClient === null) {
            trustedClient = new OauthClient();
            trustedClient.name = trustedClientInfo.name;
            trustedClient.grantType = trustedClientInfo.grantType;
            trustedClient.clientID = trustedClientInfo.clientID;

            trustedClient.save(err => {
                if(err) {
                    return new Error();
                }
                console.log('trusted app is newly registered');
            });
        } else {
            console.log('trusted app is already registered');
        }
    });
}