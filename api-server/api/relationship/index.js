const express = require('express');
const router = express.Router();

const RelationshipDBController = require(__appbase_dirname + '/models/relationship.controller');

const controller = require('./relationship.controller');

// Friend Request - Create a relationship with who has body.userId
router.post('/:userId', controller.friendRequest);

// Check what relationship with ':id'
router.get('/user/:id', controller.checkRelationship);

// Get friends, status: ACCEPTED
router.get('/status/:status', (req, res) => {
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
router.put('/fromUser/:id/accepted', controller.acceptFriendRequest);

// Decline the friend request
router.delete('/fromUser/:id/declined', controller.declineFriendRequest);

// Remove a friend
router.delete('/friend/:id', controller.deleteFriend);

module.exports = router;