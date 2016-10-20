var oauth2orize = require('oauth2orize');
var Token = require('../models/token');
var utils = require('./utils');

const createToken = (clientID, userID, grantType, cb) => {
    var token = new Token();
    token.accessToken = utils.uid(256);
    if (grantType.token_refreshable) {
        token.refreshToken = utils.uid(256);
    }
    token.expiredIn = grantType.token_duration;
    token.clientId = clientID;
    token.userId = userID;
    // TODO add scope
    token.save((err) => {
        if (err) {
            return cb(err);
        }
        return cb(err, token);
    });
};

const refreshToken = (token, cb) => {
    if (!token) {
        return cb(new Error());
    }

    // recreate access token
    token.accessToken = utils.uid(256);
    token.createdTime = Date.now();
    // TODO update scope
    Token.update({
        userId: token.userId,
        refreshToken: token.refreshToken
    }, {
        accessToken: token.accessToken,
        createdTime: token.createdTime
    }, (err, result) => {
        if (err) {
            return cb(new Error());
        }
        return cb(err, result);
    });
};

const validateToken = (accessToken, cb) => {
    if (!accessToken) {
        return cb(new oauth2orize.TokenError(
            'access token is not given',
            'invalid_request'));
    }

    Token.findOne({
        accessToken: accessToken
    }, (err, token) => {
        if (err) {
            return cb(err);
        }

        if (token === null) {
            return cb(new oauth2orize.TokenError(
                'There is not matched access token',
                'invalid_grant'));
        }

        if ((Date.now() - token.createdTime) > (token.expiredIn * 1000)) {
            console.log('token is expired!!');
            return cb(new oauth2orize.TokenError(
                'given access token was expired',
                'invalid_grant'));
        }
        return cb(null, token);
    });
};

module.exports = {
    create: createToken,
    refresh: refreshToken,
    validate: validateToken
}