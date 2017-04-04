process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
require('../../../www');

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

const User = require('../../../models/user.controller');

const RelationshipController = require('../../../models/relationship.controller.js');
const Relationship = require('../../../models/relationship');

/*
 * DB TEST: Relationship model controller test
 * ; Test find().or([...]) method
 * */
describe('Duplicate testing', () => {

    after(done => {
        RelationshipController.deleteAll(err => {
            done();
        });
    });

    const userA = 'a';
    const userB = 'b';
    it('{user A, user B, -, -} === {user B, user A, -, -}', done => {
        // Create {userOneId: a, userTwoId: b, -, -}
        RelationshipController.create(userA, userB, (err, relationship, info) => {
            // Check if can create {userOneId: b, userTwoId: a, -, -}
            RelationshipController.create(userB, userA, (err, relationship, info) => {
                if (relationship) {
                    assert.fail('relationship have to be false');
                }
                assert.ok(info);
                done();
            });
        });
    });
});

/*
 * DB TEST: Check pre save method
 * */
describe('Pre save schema method testing', () => {

    after(done => {
        RelationshipController.deleteAll(err => {
            done();
        });
    });
    it('new created relationship has a property status?', done => {
        RelationshipController.create('a', 'b', (err, newRelationship, info) => {
            Relationship.findOne({'fromUserId': newRelationship.fromUserId}, (err, relationship) => {
                console.log(relationship);
                let result = relationship.status;
                assert.equal(result, 0, 'relationships.status is 0?');
                done();
            });
        });
    });
});

/*
 * DB TEST: Read and Update test
 * */
describe('Read and Update relationship doc test', () => {

    let loggedInUser;
    let otherUser;
    let accessToken;
    let fromUserId;
    let status;
    before(done => {
        // Create two users
        // Create over 1 token
        // Create over 1 relationship - {'a', 'b', PENDING}
        User.createMany((err, users) => {
            if (users.length === 2) {
                loggedInUser = users[0];
                otherUser = users[1];
            }
            Token.create(clientId, loggedInUser.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;

                RelationshipController.create(otherUser.id, loggedInUser.id, (err, newRelationship, info) => {
                    fromUserId = newRelationship.fromUserId;
                    status = newRelationship.status;

                    done();
                });
            });
        });
    });
    afterEach(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                RelationshipController.deleteAll(err => {
                    done();
                });
            });
        });
    });

    it('Read a doc by ids(fromUserId and toUserId)', done => {
        Relationship.findOne().or([
            {fromUserId: loggedInUser.id, toUserId: otherUser.id},
            {fromUserId: otherUser.id, toUserId: loggedInUser.id},
        ]).exec((err, relationship) => {
            if (relationship) {
                console.log(relationship);
                assert.ok(relationship, 'READ SUCCESS');
            }

            done();
        });
    });

    it('Update a doc by ids and status', done => {
        // Update status to ACCEPTED
        const query = {
            $or: [
                {fromUserId: loggedInUser.id, toUserId: otherUser.id},
                {fromUserId: otherUser.id, toUserId: loggedInUser.id}
            ]
        };
        const options = {
            status: RelationshipController.statusValues.ACCEPTED,
        };
        Relationship.update(query, options, (err, result) => {
            if (!result.n) {
                assert.fail('fail to update');
            } else {
                Relationship.find().or([
                    {fromUserId: loggedInUser.id},
                    {toUserId: loggedInUser.id},
                ]).where('status').equals(RelationshipController.statusValues.ACCEPTED).exec((err, relationships) => {
                    if (relationships.length === 0) {
                        assert.fail('cannot find relationships with status ACCEPTED');
                    } else {
                        assert.ok('found relationships with status ACCEPTED')
                    }

                    console.log(relationships);
                    done();
                });
            }
        });

    });
});