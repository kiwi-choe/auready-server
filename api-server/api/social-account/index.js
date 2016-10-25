const express = require('express');
const router = express.Router();
const verifier = require('google-id-token-verifier');
const oauthInfo = require('./oauth-info');

const temp_id_token = 'xyz123';

router.get('/login/:socialapp', (req, res) => {

    var registerSocialAccount = (socialname, info, loggedinUser, done) => {

        // Save user

        // return done
        let user;
        return done(null, user);
    };

    const verifyGoogleAccount = (req, res) => {
        // Calling tokeninfo endpoint to verify id_token
        verifier.verify(req.body.id_token, oauthInfo.google.clientId, (err, tokenInfo) => {
            if(err) {
                console.log(err);
                res.sendStatus(402);    // google server error
            }
            // Register social account to User
            console.log(tokenInfo);
            registerSocialAccount('google', {
                id: tokenInfo.sub,
                token: req.body.id_token,
                name: tokenInfo.name,
                email: tokenInfo.email
            }, req.user, done => {
                done();
                res.sendStatus(200);
            });
        });
    };

    switch (req.params.socialapp) {
        case 'google':
            verifyGoogleAccount(req, res);
            break;

        default:
            console.log('unknown socialapp');
            return res.sendStatus(400);
    }
});

module.exports = router;