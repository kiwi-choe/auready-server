const passport = require('passport');
const passportStrategy = require(__appbase_dirname + '/auth-server/util/passportStrategy');

exports.signup = (req, res, next) => {

    // Set Local signup strategy by passport.authenticate method
    passport.authenticate('local-signup', (err, user, info) => {
        console.log('success to LocalSignup strategy');
        if (err) res.sendStatus(401);
        if (!user) {
            console.log(info);
            res.sendStatus(400);
        }
        // 201 code: registered a new user; signup success
        console.log(user);
        res.status(201).json(user);
    })(req, res, next);
};

exports.login = (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) res.sendStatus(401);
        if (!user) {
            console.log(info);
            res.sendStatus(400);
        }

        res.status(200).json(user);
    })(req, res, next);
};