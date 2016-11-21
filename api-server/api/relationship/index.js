const express = require('express');
const router = express.Router();

const passport = require('passport');
const oauth2Server = require(__appbase_dirname + '/auth-server/server');

const RelationshipDBController = require(__appbase_dirname + '/models/relationship.controller');

const controller = require('./relationship.controller');

// Friend Request - Create a relationship with who has body.userId
router.post('/:userId',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    controller.friendRequest);

// Check what relationship with ':id'
router.get('/user/:id',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    controller.checkRelationship);

// Get friends, status: ACCEPTED
router.get('/status/:status',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    (req, res) => {

        const status = req.params.status;
        if (status == RelationshipDBController.statusValues.ACCEPTED) {
            controller.getFriends(req.user.id, res);
        }
        else if (status == RelationshipDBController.statusValues.PENDING) {
            controller.getPendingRequest(req.user.id, res);
        }
        else {
            console.log('wrong status value');
            return res.sendStatus(400);
        }
    });

// Accept the friend request
router.put('/fromUser/:id/accepted',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    controller.acceptFriendRequest);


// Decline the friend request
router.delete('/fromUser/:id/declined',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    controller.declineFriendRequest);

// Remove a friend
router.delete('/friend/:id',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    controller.deleteFriend);

module.exports = router;