const Relationship = require(__appbase_dirname + '/models/relationship');

// Avoid duplication
const _create = (fromUserId, toUserId, done) => {
    // Check to avoid duplicate
    Relationship.find().or([
        {fromUserId: fromUserId, toUserId: toUserId},
        {fromUserId: toUserId, toUserId: fromUserId}
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
        let newRelationShip = new Relationship();
        newRelationShip.fromUserId = fromUserId;
        newRelationShip.toUserId = toUserId;
        newRelationShip.status = 0;
        newRelationShip.save(err => {
            if (err) {
                return done(err);
            }
            return done(err, newRelationShip);
        });
    });
};

/*
 * Show friends
 * To set '1' into 'status' means they are relationship.
 * */
const ACCEPTED = 1;
// const _readAccepted = (userId, done) => {
//     Relationship.find().or([{userOneId: userId}, {userTwoId: userId}]).where({status: ACCEPTED}).exec((err, relationships) => {
//         if (err) {
//             return done(err);
//         }
//         if (!relationships) {
//             return done(null, false);
//         }
//         return done(null, relationships);
//     });
// };

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