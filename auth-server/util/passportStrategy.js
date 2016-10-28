const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
var oauth2orize = require('oauth2orize');

const predefine = require('./predefine');
const tokenizer = require('../../utils/tokenizer');

const OauthClient = require('../../models/oauthClient');
const User = require('../../models/user');

exports.setup = () => {

    passport.use(new BasicStrategy({
        passReqToCallback: true
    }, (req, clientId, clientSecret, done) => {
        console.log('enter basic strategy');
        if (!req.body.grant_type) {
            var error = new oauth2orize.TokenError(
                'there is no grant_type field in body',
                'invalid_request');
            return done(error);
        }

        switch (req.body.grant_type) {
            case predefine.oauth2.type.password.name:
                break;
            default:
                var error = new oauth2orize.TokenError(
                    'This client cannot be used for ' + req.body.grant_type,
                    'unsupported_grant_type');
                return done(error);
        }

        // validate client credential
        OauthClient.findOne({
            clientId: clientId,
            clientSecret: clientSecret
        }, (err, oauthClient) => {
            if (err) {
                var error = new oauth2orize.TokenError(
                    'server error during validating client credential',
                    'server_error');
                return done(error);
            }
            if (oauthClient === null) {
                // this error will be handled by oauth2orize
                var error = new oauth2orize.TokenError(
                    'Client authentication failed',
                    'invalid_client');
                return done(error);
            }
            if (oauthClient.grantType[0] !== req.body.grant_type) {
                done(new oauth2orize.TokenError(
                    'This client cannot be used for ' + req.body.grant_type,
                    'unsupported_grant_type'));
            }
            return done(null, oauthClient);
        });
    }));

    passport.use(new BearerStrategy({
        passReqToCallback: true
    }, (req, accessToken, done) => {
        console.log('bearer strategy');
        tokenizer.validate(accessToken, (err, token) => {
            if (err) {
                return done(err);
            }
            User.findOne({
                '_id': token.userId
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