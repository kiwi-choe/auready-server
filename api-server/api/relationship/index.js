const express = require('express');
const router = express.Router();

const passport = require('passport');
const oauth2Server = require(__appbase_dirname + '/auth-server/server');

const RelationshipController = require(__appbase_dirname + '/models/relationship.controller');
const Relationship = require(__appbase_dirname + '/models/relationship');

// Friend Request - Create a relationship with who has body.userId
router.post('/:userId',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    (req, res) => {
        RelationshipController.create(req.user.id, req.params.userId, (err, relationship, info) => {
            if (err) {
                return res.sendStatus(400);
            }
            if (!relationship) {
                console.log(info);
                return res.sendStatus(409); // 409: Conflict, if resource already exists.
            }
            // res 201 code & TODO add the notification message
            console.log(relationship);
            return res.sendStatus(201);
        });
    });

// Check what relationship with ':userId'
router.get('/:userId',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    (req, res) => {
        Relationship.findOne().or([
            {fromUserId: req.user.id, toUserId: req.params.userId},
            {fromUserId: req.params.userId, toUserId: req.user.id}
        ]).exec((err, relationship) => {
            if (err) {
                return res.sendStatus(400);
            }
            if (!relationship) {
                return res.sendStatus(404); // 404: Not found.
            }
            // There is a relationship within two users
            return res.status(200).json({
                'fromUserId': relationship.fromUserId,
                'status': relationship.status
            });
        })
    });

module.exports = router;