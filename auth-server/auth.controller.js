const express = require('express');
const router = express.Router();
const passport = require('passport');
const oauth2Server = require('./server');

const Token = require('../models/token');

// Authenticate client and create access token
router.post('/', (req, res, next) => {
        next();
    },
    passport.authenticate('basic', {session: false}),
    oauth2Server.token());

// Logout
// Delete access token for all grant types
router.delete('/',
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
    });

module.exports = router;