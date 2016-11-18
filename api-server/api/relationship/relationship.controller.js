const RelationshipDBController = require(__appbase_dirname + '/models/relationship.controller');

exports.getFriends = (loggedInUserId, res) => {

    RelationshipDBController.readAccepted(loggedInUserId, (err, relationships, info) => {
        if (err) {
            return res.sendStatus(400);
        }
        console.log(relationships);
        if (!relationships) {
            console.log(info);
            return res.sendStatus(404); // Not found.
        }
        // loop
        let friends = relationships.map((item) => {
            if (loggedInUserId !== item.fromUserId) {
                return item.fromUserId;
            } else {
                return item.toUserId;
            }
        });
        console.log('friends:' + friends);
        return res.status(200).json({
            friends: friends
        });
    });
};