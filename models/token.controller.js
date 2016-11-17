var oauth2orize = require('oauth2orize');
const Token = require(__appbase_dirname + '/models/token');
const utils = require(__appbase_dirname + '/utils/utils');

const _create = (clientID, userID, grantType, done) => {
    let newToken = new Token();
    newToken.accessToken = utils.uid(256);
    newToken.createdTime = Date.now();
    if (grantType.token_refreshable) {
        newToken.refreshToken = utils.uid(256);
    }
    newToken.expiredIn = grantType.token_duration;
    newToken.clientId = clientID;
    newToken.userId = userID;
    // TODO add scope
    newToken.save((err) => {
        if (err) {
            return done(err);
        }
        return done(err, newToken);
    });
};

const _update = (token, done) => {
    if (!token) {
        return done(new Error());
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
            return done(new Error());
        }
        return done(err, result);
    });
};


const _validate = (accessToken, done) => {
    if (!accessToken) {
        return done(new oauth2orize.TokenError(
            'access token is not given',
            'invalid_request'));
    }

    Token.findOne({
        accessToken: accessToken
    }, (err, token) => {
        if (err) {
            return done(err);
        }

        if (token === null) {
            return done(new oauth2orize.TokenError(
                'There is not matched access token',
                'invalid_grant'));
        }

        if ((Date.now() - token.createdTime) > (token.expiredIn * 1000)) {
            console.log('token is expired!!');
            return done(new oauth2orize.TokenError(
                'given access token was expired',
                'invalid_grant'));
        }
        return done(null, token);
    });
};

const _delete = (accessToken, done) => {
    Token.remove({
        'accessToken': accessToken
    }, (err, removedCount) => {
        if (err) {
            // TODO need to set proper error
            return done(err);
        }
        if (removedCount.result.n === 0) {
            console.log('accessToken was not found');
            return done(null, false);
        }
        return done(null, true);
    });
};

const _deleteAll = done => {
    Token.remove({}, err => {
        if(err) return done(err);
        return done(null);
    });
};

// create the model for users and expose it to our app
module.exports = {
    create: _create,
    update: _update,
    validate: _validate,
    delete: _delete,
    deleteAll: _deleteAll
}