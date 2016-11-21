const RelationshipDBController = require(__appbase_dirname + '/models/relationship.controller');
const Relationship = require(__appbase_dirname + '/models/relationship');

exports.friendRequest = (req, res) => {
    RelationshipDBController.create(req.user.id, req.params.userId, (err, relationship, info) => {
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
};

exports.checkRelationship = (req, res) => {

    Relationship.findOne().or([
        {fromUserId: req.user.id, toUserId: req.params.id},
        {fromUserId: req.params.id, toUserId: req.user.id}
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
    });
};

exports.getFriends = (loggedInUserId, res) => {

    RelationshipDBController.readAccepted(loggedInUserId, (err, relationships, info) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!relationships) {
            console.log(info);
            return res.sendStatus(404); // Not found.
        }
        // loop
        let friends = relationships.map(item => {
            if (loggedInUserId !== item.fromUserId) {
                return item.fromUserId;
            } else {
                return item.toUserId;
            }
        });
        return res.status(200).json({
            friends: friends
        });
    });
};

exports.getPendingRequest = (toUserId, res) => {
    // Find pending requests to the logged in user
    RelationshipDBController.readPending(toUserId, (err, relationships, info) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!relationships) {
            console.log(info);
            return res.sendStatus(404); // Not found
        }
        // loop
        let fromUsers = relationships.map(item => {
            return item.fromUserId;
        });
        return res.status(200).json({
            fromUsers: fromUsers
        });
    });
};

exports.acceptFriendRequest = (req, res) => {

    const query = {
        fromUserId: req.params.id,
        toUserId: req.user.id,
        status: RelationshipDBController.statusValues.PENDING
    };
    const options = {
        fromUserId: req.user.id,
        toUserId: req.params.id,
        status: RelationshipDBController.statusValues.ACCEPTED,
    };
    RelationshipDBController.update(query, options, (err, result) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!result.n) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.declineFriendRequest = (req, res) => {

    const query = {
        fromUserId: req.params.id,
        toUserId: req.user.id,
        status: RelationshipDBController.statusValues.PENDING
    };
    RelationshipDBController.delete(query, (err, isRemoved) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.deleteFriend = (req, res) => {

    const query = {
        $or: [
            {fromUserId: req.user.id, toUserId: req.params.id},
            {fromUserId: req.params.id, toUserId: req.user.id}
        ],
        status: RelationshipDBController.statusValues.ACCEPTED
    };

    RelationshipDBController.delete(query, (err, isRemoved) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};