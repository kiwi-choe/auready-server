const oauth2orize = require('oauth2orize');
const tokenizer = require('../utils/tokenizer');
const predefine = require('./predefine');

const User = require('../models/user');
const Token = require('../models/token');

module.exports = (server) => {
    if (!server) {
        throw Error();
    }

    // Register exchange to get access token from authorization server
    // grant-type: password
    server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
        console.log('enter exchange function password grant type');

        // client is already verified using middleware(basic), but cannot be sure user
        // check username type
        let query;
        let isLocalAccount = true;
        query = {'local.id': username};

        User.findOne(query, (err, user) => {
            if (err) {
                return done(new oauth2orize.TokenError(
                    'Error occurs during finding token',
                    'server_error'
                ));
            }
            if (user === null) {
                return done(new oauth2orize.TokenError(
                    'resource owner credential is not correct',
                    'invalid_grant'
                ));
            }
            if (isLocalAccount) {
                if (!user.validPassword(password)) {
                    return done(new oauth2orize.TokenError(
                        'resource owner credential is not correct',
                        'invalid_grant'
                    ));
                }
            }

            // Check if access token for this user exists
            Token.findOne({
                'clientId': client.clientId,
                'userId': user.id
            }, (err, token) => {
                if (err) {

                }
                if (token) {
                    console.log('token exists already');
                    // Check access token expiration

                } else {
                    tokenizer.create(client.clientId, user.id, predefine.oauth2.type.password,
                        (err, newToken) => {
                            if(err) {
                                return done(new oauth2orize.TokenError(
                                    'Error occurs during creating token',
                                    'server_error'
                                ));
                            }
                            return done(null,
                                newToken.accessToken,
                                newToken.refreshToken,
                                {
                                    expiresIn: newToken.expiredIn,
                                    userID: user.id
                                }
                            );
                        });
                }
            });
        });
    }));

    server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
        Token.findOne({
            clientID: client.clientID,
            refreshToken: refreshToken
        }, (err, token) => {
            if (err) {
                return done(new oauth2orize.TokenError(
                    'Error occurs during finding token',
                    'server_error'
                ));
            }
            if (!token) {
                return done(new oauth2orize.TokenError(
                    'This refresh token doesnt exist',
                    'invalid_grant'
                ));
            }

            tokenizer.refresh(token, (err, updatedToken) => {
                if (err) {
                    return done(new oauth2orize.TokenError(
                        'Error occurs during refreshing token',
                        'server_error'
                    ));
                }
                return done(null,
                    updatedToken.accessToken,
                    updatedToken.refreshToken,
                    {
                        expiresIn: updatedToken.expiredIn
                    }
                );
            });
        });
    }));

}