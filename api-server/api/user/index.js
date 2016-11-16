const express = require('express');
const router = express.Router();

const passport = require('passport');
const oauth2Server = require(__appbase_dirname + '/auth-server/server');

const User = require(__appbase_dirname + '/models/user');

// GET users by string(name)
router.get('/:search',
    passport.authenticate('bearer', {session: false}),
    oauth2Server.error(),
    (req, res) => {
        let regexValue = req.params.search;
        console.log(regexValue);
        // Search using 'search'
        User.find({'name': new RegExp(regexValue)}, (err, users) => {
            if(err) res.sendStatus(400);
            if(users.length === 0) {
                console.log('no users');
                res.sendStatus(204);
            }
            console.log(users);
            res.status(200).json(users);
        });
    });

module.exports = router;
