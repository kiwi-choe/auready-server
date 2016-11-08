const express = require('express');
const router = express.Router();
const passport = require('passport');
const oauth2Server = require('./server');

const Token = require(__appbase_dirname + '/models/token');

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
        Token.model.remove({
            'accessToken': req.body.accessToken
        }, (err, removedCount) => {
            if (err) {
                // TODO need to set proper error
                return res.sendStatus(400);
            }
            if (removedCount.result.n === 0) {
                console.log('accessToken was not found');
                return res.sendStatus(204);
            }
            return res.sendStatus(200);
        });
    });

module.exports = router;