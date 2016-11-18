const Relationship = require(__appbase_dirname + '/models/relationship');

// enum values of status
const _status = {
    PENDING: 0,
    ACCEPTED: 1,
    DECLINED: 2
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

const _update = (query, options, done) => {
    Relationship.update(query, options, (err, result) => {
        if (err) {
            return done(err);
        }
        return done(err, result);
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
    deleteAll: _deleteAll,
    readAccepted: _readAcceptedStatus,
    update: _update,
    statusValues: _status
}