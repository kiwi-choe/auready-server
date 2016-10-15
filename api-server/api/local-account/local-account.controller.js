const passport = require('passport');
const passportStrategy = require('../../../auth-server/passportStrategy');

exports.signup = (req, res, next) => {

    // Set Local signup strategy by passport.authenticate method
    passport.authenticate('local-signup', {session: false},
        (err, user, info) => {
            console.log('success to LocalSignup strategy');
            if(err) return next(err);

            // error
            if(!user) {
                console.log(info);
                res.sendStatus(400);
            }

        })(req, res, next);

    
};

exports.login = (req, res, next) => {
    passport.authenticate('local-login', {session: true},
        (err, user, info) => {
            if(err) return next(err);
            if(!user) {
                console.log(info);
                return res.json(400, info);
            }

            req.login(user, err => {
                if(err) return next(err);
                return res.json(200);
            });
        })(req, res, next);
};

