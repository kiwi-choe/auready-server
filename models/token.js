const mongoose = require('mongoose');
const oauth2orize = require('oauth2orize');
const utils = require('../utils/utils');

const schema = mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    expiredIn: Number,
    clientId: String,
    userId: String,
    createdTime: Number
});

const _model = mongoose.model('AccessToken', schema);

const _create = (clientID, userID, grantType, done) => {
    let newToken = new _model();
    newToken.accessToken = utils.uid(256);
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

const _refresh = (token, done) => {
    if (!token) {
        return done(new Error());
    }

    // recreate access token
    token.accessToken = utils.uid(256);
    token.createdTime = Date.now();
    // TODO update scope
    _model.update({
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

    _model.findOne({
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

schema.pre('save', function (next) {
    if (!this.isNew) {
        return next();
    }
    this.createdTime = Date.now();
    next();
});


// create the model for users and expose it to our app
module.exports = {
    model: _model,
    create: _create,
    refresh: _refresh,
    validate: _validate
}