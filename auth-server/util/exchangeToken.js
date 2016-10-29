const oauth2orize = require('oauth2orize');
const tokenizer = require(__appbase_dirname + '/utils/tokenizer');
const predefine = require('./predefine');

const User = require(__appbase_dirname + '/models/user');
const Token = require(__appbase_dirname + '/models/token');

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
        let isLocalAccount = false;
        if (username === 'google') {
            query = {'password': password};
        }
        else {
            isLocalAccount = true;
            query = {'email': username};
        }

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
                    return done(new oauth2orize.TokenError(
                        'Error occurs during finding token',
                        'server_error'
                    ));
                }
                if (token) {
                    console.log('token exists already');
                    // Check access token expiration
                    return done(null,
                        token.accessToken,
                        token.refreshToken,
                        {
                            expires_in: token.expiredIn,
                            user_id: user.id
                        }
                    );
                } else {
                    tokenizer.create(client.clientId, user.id, predefine.oauth2.type.password,
                        (err, newToken) => {
                            if (err) {
                                return done(new oauth2orize.TokenError(
                                    'Error occurs during creating token',
                                    'server_error'
                                ));
                            }
                            return done(null,
                                newToken.accessToken,
                                newToken.refreshToken,
                                {
                                    expires_in: newToken.expiredIn,
                                    user_id: user.id
                                }
                            );
                        });
                }
            });
        });
    }));

    server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
        Token.findOne({
            'clientId': client.clientId,
            'refreshToken': refreshToken
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
                    {expires_in: updatedToken.expiredIn}
                );
            });
        });
    }));

}