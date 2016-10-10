const passport = require('passport');
const PublicClientStrategy = require('passport-oauth2-public-client').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;

const predefine = require('./predefine');
const tokenizer = require('../utils/tokenizer');

const OauthClient = require('../models/oauthClient');
const User = require('../models/user');

const publicClientStrategy = () => {

    passport.use(new PublicClientStrategy({
        passReqToCallback: true
    }, (req, clientId, done) => {
        console.log(req.body);
        if(req.body.grant_type === predefine.oauth2.type.password.name) {
            // Find client by id
            OauthClient.findOne({clientId: req.body.client_id}, (err, oauthClient) => {
                if(err) {

                }
                if(!oauthClient) {

                }
                if(oauthClient.grantType[0] !== req.body.grant_type) {

                }
                // if there is no error, oauth2 processing is continued
                return done(null, oauthClient);
            });
        }
        else {
            // this error will be handled by oauth2orize
            const error = new oauth2orize.TokenError(
                req.body.grant_type + ' type is not supported',
                'unsupported_grant_type');
            return done(error);
        }
    }));
};

const bearerStrategy = () => {
    
    passport.use(new BearerStrategy({
        passReqToCallback: true
    }, (req, accessToken, done) => {
        console.log('bearer strategy');
        tokenizer.validate(accessToken, (err, token) => {
            if (err) {
                return done(err);
            }
            User.findOne({
                '_id': token.userID
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        reason: 'invalid-user'
                    });
                }

                // token info can be used for handling REST API
                // so token info is set to result which is returned after authentication
                user.tokenInfo = token;
                return done(null, user);
            });
        });
    }));
};

const localSignupStrategy = () => {

};

module.exports = {
    PublicClient: publicClientStrategy,
    Bearer: bearerStrategy,
    LocalSignup: localSignupStrategy
}