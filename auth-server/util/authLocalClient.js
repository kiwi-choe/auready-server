const OauthClient = require('../../models/oauthClient');
const trustedClientInfo = require(__appbase_dirname + '/predefine').trustedClientInfo;

// Register local client info
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
            trustedClient.clientId = trustedClientInfo.clientId;
            trustedClient.clientSecret = trustedClientInfo.clientSecret;

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