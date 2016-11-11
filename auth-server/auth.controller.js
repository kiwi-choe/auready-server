const express = require('express');
const router = express.Router();
const passport = require('passport');
const oauth2Server = require('./server');

const TokenController = require(__appbase_dirname + '/models/token.controller');

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
        // TODO get using req.body.accessToken -> get from header, coz send same resources of two
        TokenController.delete(req.body.accessToken, (err, isRemoved) => {
            if (err) {
                return res.sendStatus(400);
            }
            if (!isRemoved) {
                return res.sendStatus(204);
            }
            return res.sendStatus(200);
        });
    });

module.exports = router;