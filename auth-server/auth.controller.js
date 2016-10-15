const express = require('express');
const router = express.Router();

const passport = require('passport');
const oauth2Server = require('./server');

const Token = require('../models/token');

// Authenticate client and create access token
exports.login = (req, res, next) => {
    next(),
        passport.authenticate('oauth2-public-client', {session: false}),
        oauth2Server.token();
};

// Delete access token for all grant types
exports.logout = () => {
    passport.authenticate('bearer', {session: false}),
        (req, res) => {
            console.log('bearer strategy for token delete');
            Token.remove({
                'accessToken': req.user.tokenInfo.accessToken,
                'id': req.user_id
            }, (err) => {
                if (err) {
                    // TODO need to set proper error
                    res.sendStatus(400);
                } else {
                    res.sendStatus(200);
                }
            });
        }
};

router.post('/', login);
router.delete('/', logout);

module.exports = router;