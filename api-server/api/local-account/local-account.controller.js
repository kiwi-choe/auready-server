const passport = require('passport');
const passportStrategy = require(__appbase_dirname + '/auth-server/util/passportStrategy');
const Relationship = require(__appbase_dirname + '/models/relationship.controller');

exports.signup = (req, res, next) => {

    // Set Local signup strategy by passport.authenticate method
    passport.authenticate('local-signup', (err, user, info) => {
        console.log('success to LocalSignup strategy');
        if (err) {
            return res.sendStatus(401);
        }
        if (!user) {
            console.log(info);
            return res.sendStatus(400);
        }

        // Create the new relationship - friend 'ME'
        Relationship.createFriendMe(user.id, isSuccess => {
            if(!isSuccess) {
                console.log('\n Creating friend ME is failed');
                return res.sendStatus(400);
            }
            // 201 code: registered a new user; signup success
            console.log('user: \n', user);
            return res.status(201).json(user);
        });

    })(req, res, next);
};

exports.login = (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) {
            return res.sendStatus(401);
        }
        if (!user) {
            console.log(info);
            return res.sendStatus(400);
        }

        return res.status(200).json(user);
    })(req, res, next);
};