const RelationshipDBController = require(__appbase_dirname + '/models/relationship.controller');
const Relationship = require(__appbase_dirname + '/models/relationship');
const UserController = require(__appbase_dirname + '/api-server/api/user/user.controller');
const NotificationController = require(__appbase_dirname + '/api-server/api/notification/notification.controller');
const TYPES = require(__appbase_dirname + '/api-server/api/notification/notificationUtils').types;

exports.friendRequest = (req, res) => {
    const toUserId = req.params.toUserId;
    const fromUser = {
        id: req.user.id,
        name: req.user.name
    };

    NotificationController.sendNotification(TYPES.friend_request, toUserId, fromUser, isSuccess => {
        if(!isSuccess) {
            console.log('send a notification to fcm server is failed');
            return res.sendStatus(500);
        }

        RelationshipDBController.create(fromUser.id, toUserId, (err, relationship, info) => {
            if(err) {
                return res.sendStatus(400);
            }
            if (!relationship) {
                console.log(info);
                return res.sendStatus(409); // 409: Conflict, if resource already exists.
            }
            console.log('\nrelationship - ', relationship);
            return res.sendStatus(201);
        });
    });
};

exports.checkRelationship = (req, res) => {

    Relationship.findOne().or([
        {fromUserId: req.user.id, toUserId: req.params.userId},
        {fromUserId: req.params.userId, toUserId: req.user.id}
    ]).exec((err, relationship) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!relationship) {
            console.log('no relationships');
            return res.sendStatus(204); // 204: Not found.
        }
        // There is a relationship within two users
        return res.status(200).json({
            'fromUserId': relationship.fromUserId,
            'status': relationship.status
        });
    });
};

exports.getFriends = (req, res) => {

    const loggedInUserId = req.user.id;

    console.log('entered into getFriends');
    let getUsers = (friendIds, done) => {
        UserController.getUsersByIds(friendIds, (err, friends) => {
            return done(err, friends);
        });
    };

    RelationshipDBController.readAccepted(loggedInUserId, (err, relationships, info) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!relationships) {
            console.log(info);
            return res.sendStatus(204); // no friend; no status:ACCEPTED
        }
        // loop
        let friendIds = relationships.map(item => {
            if (loggedInUserId !== item.fromUserId) {
                return item.fromUserId;
            } else {
                return item.toUserId;
            }
        });

        // get user info by id
        getUsers(friendIds, (err, friends) => {
            if (err) {
                return res.sendStatus(404); // Not found - users by ids
            }
            console.log(friends);
            if(!friends) {
                return res.sendStatus(204); // Not found
            }
            // and set the response body, 'friends' - id, name, email
            return res.status(200).json({
                friends: friends
            });
        });

    });
};

exports.getPendingRequest = (req, res) => {

    const toUserId = req.user.id;
    // Find pending requests to the logged in user
    RelationshipDBController.readPending(toUserId, (err, relationships, info) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!relationships) {
            console.log(info);
            return res.sendStatus(204); // no pending relationship
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
        fromUserId: req.params.fromUserId,
        toUserId: req.user.id,
        status: RelationshipDBController.statusValues.PENDING
    };
    const options = {
        fromUserId: req.user.id,
        toUserId: req.params.fromUserId,
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

exports.deleteFriendRequest = (req, res) => {
    const query = {
        fromUserId: req.params.fromUserId,
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