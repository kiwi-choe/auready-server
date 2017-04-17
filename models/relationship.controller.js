const Relationship = require(__appbase_dirname + '/models/relationship');

// enum values of status
const _status = {
    PENDING: 0,
    ACCEPTED: 1,
    NO_STATUS: 2
};

// Avoid duplication
const _create = (fromUserId, toUserId, done) => {
    // Check to avoid duplicate
    Relationship.find().or([
        {fromUserId: fromUserId, toUserId: toUserId},
        {fromUserId: toUserId, toUserId: fromUserId}
    ]).exec((err, relationships) => {
        if (err) {
            return done(err);
        }
        // exists a relationship already, res 400 code
        if (relationships.length !== 0) {
            console.log('WARNING! this relationship already exists');
            return done(null, false, {reason: 'exist relationship'});
        }
        // create new relationship
        let newRelationShip = new Relationship();
        newRelationShip.fromUserId = fromUserId;
        newRelationShip.toUserId = toUserId;
        newRelationShip.status = _status.PENDING;
        newRelationShip.save(err => {
            if (err) {
                return done(err);
            }
            return done(null, newRelationShip);
        });
    });
};

const _createFriendMe = (userId, done) => {
    // Check to avoid duplicate
    Relationship.find({fromUserId: userId, toUserId: userId},
        (err, relationships) => {
            if (err) {
                return done(false);
            }
            // exists a relationship already, res 400 code
            if (relationships.length !== 0) {
                console.log('WARNING! this relationship already exists');
                return done(false);
            }

            // create new relationship
            let newRelationShip = new Relationship();
            newRelationShip.fromUserId = userId;
            newRelationShip.toUserId = userId;
            newRelationShip.status = _status.ACCEPTED;
            newRelationShip.save(err => {
                if (err) {
                    return done(false);
                }
                console.log('\nsuccess to save creating FriendMe relationship, ', newRelationShip);
                return done(true);
            });
        });
};

/*
 * Show friends
 * {status: 1} means they are friends.
 * */
const _readAcceptedStatus = (userId, done) => {
    Relationship.find().or([
        {fromUserId: userId},
        {toUserId: userId},
    ]).where('status').equals(_status.ACCEPTED).exec((err, relationships) => {
        if (err) {
            return done(err);
        }
        if (relationships.length === 0) {
            return done(null, false, {reason: 'no friend relationship'});
        }
        return done(null, relationships);
    });
};

/*
 * Get pending requests
 * {status: 0}, {toUserId: id of the logged in user}
 * */
const _readPendingStatus = (toUserId, done) => {
    Relationship.find({toUserId: toUserId, status: _status.PENDING}, (err, relationships) => {
        if (err) {
            return done(err);
        }
        if (relationships.length === 0) {
            return done(null, false, {reason: 'no pending relationship'});
        }
        return done(null, relationships);
    });
};

/*
 * Get relationship status of two users
 * regardless orders
 * */
const _readStatus = (loggedInUserId, otherUserId, done) => {
    Relationship.findOne().or([
        {fromUserId: loggedInUserId, toUserId: otherUserId},
        {fromUserId: otherUserId, toUserId: loggedInUserId},
    ]).exec((err, relationship) => {
        if (err) {
            return done(err);
        }

        let status;
        if (relationship) {
            status = relationship.status;
        } else {
            status = _status.NO_STATUS;
        }
        return done(null, status);
    });
};

const _update = (query, options, done) => {
    Relationship.update(query, options, (err, result) => {
        if (err) {
            return done(err);
        }
        return done(err, result);
    });
};

const _delete = (query, done) => {
    Relationship.remove(query, (err, removedCount) => {
        if (err) {
            return done(err);
        }
        if (removedCount.result.n === 0) {
            return done(null, false);
        }
        return done(null, true);
    });
};

const _deleteAll = done => {
    Relationship.remove({}, err => {
        if (err) {
            return done(err);
        }
        return done(null);
    });
};

module.exports = {
    create: _create,
    createFriendMe: _createFriendMe,
    deleteAll: _deleteAll,
    readAccepted: _readAcceptedStatus,
    readPending: _readPendingStatus,
    readStatus: _readStatus,
    update: _update,
    delete: _delete,
    statusValues: _status
}