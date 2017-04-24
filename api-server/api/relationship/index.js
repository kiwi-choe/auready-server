const express = require('express');
const router = express.Router();

const RelationshipDBController = require(__appbase_dirname + '/models/relationship.controller');

const controller = require('./relationship.controller');

// Friend Request - Create a relationship with a user who has body.userId
router.post('/:toUserId', controller.friendRequest);

// Check what relationship with ':userId'
router.get('/:userId', controller.checkRelationship);

// Get friends, status: ACCEPTED
router.get('/status/accepted', controller.getFriends);
router.get('/status/pending', controller.getPendingRequest);
    // console.log('xxx: ', status);
    // if (status == RelationshipDBController.statusValues.ACCEPTED) {
    //     controller.getFriends(req.user.id, res);
    // }
    // else if (status == RelationshipDBController.statusValues.PENDING) {
    //     controller.getPendingRequest(req.user.id, res);
    // }
    // else {
    //     console.log('wrong status value');
    //     return res.sendStatus(400);
    // }

// Accept the friend request
router.put('/:fromUserId/accepted', controller.acceptFriendRequest);

// Delete the friend request
router.delete('/:fromUserId', controller.deleteFriendRequest);

// Remove a friend
router.delete('/friend/:id', controller.deleteFriend);

module.exports = router;