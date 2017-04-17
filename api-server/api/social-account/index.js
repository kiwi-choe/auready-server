const express = require('express');
const router = express.Router();
const verifier = require('google-id-token-verifier');
const oauthInfo = require(__appbase_dirname + '/predefine').socialAuthInfo;

const User = require(__appbase_dirname + '/models/user');
const UserController = require(__appbase_dirname + '/models/user.controller');
const Relationship = require(__appbase_dirname + '/models/relationship.controller');

router.post('/signup', (req, res) => {

    const registerSocialAccount = (name, email, id_token) => {
        User.findOne({'password': id_token}, (err, user) => {
            if (err) {
                return res.sendStatus(401);
            }
            if (user) {
                console.log('this social account already exists, just pass this userinfo');
                return res.status(200).json(user);
            }
            UserController.create(name, email, id_token, false, (err, newUser) => {
                if (err) {
                    return res.sendStatus(401);
                }
                // Create the new relationship - friend 'ME'
                Relationship.createFriendMe(newUser.id, isSuccess => {
                    if(!isSuccess) {
                        console.log('\n Creating friend ME is failed');
                        return res.sendStatus(400);
                    }
                    // 201 code: registered a new user; signup success
                    console.log('newUser: \n', newUser);
                    return res.status(201).json(newUser);
                });
            });
        });
    };

    const verifyGoogleAccount = (req, res) => {
        // Calling tokeninfo endpoint to verify id_token
        verifier.verify(req.body.id_token, oauthInfo.google.clientId, (err, tokenInfo) => {
            // verifier.verify(temp_id_token, oauthInfo.google.clientId, (err, tokenInfo) => {
            if (err) {
                console.log(err);
                return res.sendStatus(402);    // google server error
            }
            if(tokenInfo) {
                registerSocialAccount(tokenInfo.name, tokenInfo.email, req.body.id_token);
            }
        });
    };

    switch (req.body.socialapp) {
        case 'google':
            verifyGoogleAccount(req, res);
            break;

        default:
            console.log('unknown socialapp');
            return res.sendStatus(400);
    }
});

module.exports = router;