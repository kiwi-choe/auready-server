const Relationship = require(__appbase_dirname + '/models/relationship');

// Avoid duplication
const _create = (user1, user2, actionUserId, done) => {
    // Check to avoid duplicate
    Relationship.find().or([
        {userOneId: user1, userTwoId: user2},
        {userOneId: user2, userTwoId: user1}
    ]).exec((err, relationship) => {
        if (err) {
            return done(err);
        }
        // exists a relationship already, res 400 code
        if (relationship.length !== 0) {
            console.log('WARNING! this relationship already exists');
            return done(null, false, {reason: 'exist relationship'});
        }
        // create new relationship
        let newRelationShip = new Relationship({
            userOneId: user1,
            userTwoId: user2,
            actionUserId: actionUserId
        });
        newRelationShip.save(err => {
            if (err) {
                return done(err);
            }
            console.log(newRelationShip);
            return done(err, newRelationShip);
        });
    });
    // Relationship.find({userOneId: user1, userTwoId: user2},
    //     (err, relationships) => {
    //         if (err) {
    //             return done(err);
    //         }
    //         // exists a relationship already, res 400 code
    //         if (relationships.length !== 0) {
    //             console.log('WARNING! this relationship already exists');
    //             return done(null, false, {reason: 'exist relationship'});
    //         }
    //         // create new relationship
    //         let newRelationShip = new Relationship({user1, user2, actionUserId});
    //         newRelationShip.save(err => {
    //             if (err) {
    //                 return done(err);
    //             }
    //             return done(err, newRelationShip);
    //         });
    //     });
};

/*
 * Show friends
 * To set '1' into 'status' means they are relationship.
 * */
const ACCEPTED = 1;
const _readAccepted = (userId, done) => {
    Relationship.find().or([{userOneId: userId}, {userTwoId: userId}]).where({status: ACCEPTED}).exec((err, relationships) => {
        if (err) {
            return done(err);
        }
        if (!relationships) {
            return done(null, false);
        }
        return done(null, relationships);
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
    deleteAll: _deleteAll
}