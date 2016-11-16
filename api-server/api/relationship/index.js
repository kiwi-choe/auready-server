const express = require('express');
const router = express.Router();

const passport = require('passport');
const oauth2Server = require(__appbase_dirname + '/auth-server/server');

const Relationship = require(__appbase_dirname + '/models/relationship.controller');

// Friend Request - Create a relationship with who has body.userId
router.post('/:userId',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    (req, res) => {
        // Search req.params.userId in Relationship db

        Relationship.create(req.user.id, req.params.userId, req.user.id, (err, relationship, info) => {
           if(err) {
               return res.sendStatus(400);
           }
           if(!relationship) {
               console.log(info);
               return res.sendStatus(409); // 409: Conflict, if resource already exists.
           }
            // res 201 code & TODO add the notification message
            console.log(relationship);
            return res.sendStatus(201);
        });
    });

module.exports = router;