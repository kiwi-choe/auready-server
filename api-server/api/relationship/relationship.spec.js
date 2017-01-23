process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');

const RelationshipController = require('../../../models/relationship.controller.js');
const Relationship = require('../../../models/relationship');

describe('POST /relationship/:userId', () => {

    let accessToken;
    let loggedinuser;
    let otheruser;
    before(done => {
        // Create logged in user and other user
        User.createMany((err, users) => {
            if (users.length === 2) {
                loggedinuser = users[0];
                otheruser = users[1];
            }
            Token.create(clientId, loggedinuser.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
            });
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });

    it('friendRequest (Add a relationship) should return 201 code', done => {
        request
            .post('/relationship/' + otheruser.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(201)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe('Check the relationship - GET /relationship/user/:userId', () => {

    // conditions
    // 1. 2 users at least
    // 2. a relationship with status 0:pending - requested to be a friend
    let accessToken;
    let loggedInUser;
    let otherUser;

    let fromUserId;
    let status;
    beforeEach(done => {
        // Create logged in user and other user
        User.createMany((err, users) => {
            if (users.length === 2) {
                loggedInUser = users[0];
                otherUser = users[1];
            }
            Token.create(clientId, loggedInUser.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
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

    it('has a relationship with :id of user', done => {

        // Create the relationship within two users
        RelationshipController.create(otherUser.id, loggedInUser.id, (err, newRelationship, info) => {

            fromUserId = newRelationship.fromUserId;
            assert.equal(fromUserId, otherUser.id, 'Success to create the new relationship');
            status = newRelationship.status;
            assert.equal(status, 0);
        });

        request
            .get('/relationship/' + otherUser.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // can check what relationship with 'otherUser.id' using 'actionUserId' and 'status'
                res.status.should.equal(200);
                res.body.should.have.property('fromUserId').equal(fromUserId);
                res.body.should.have.property('status').equal(status);
                done();
            });
    });

    it('no relationship', done => {
        request
            .get('/relationship/' + otherUser.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                // can check what relationship with 'otherUser.id' using 'actionUserId' and 'status'
                res.status.should.equal(404);
                done();
            });
    });
});

// TODO Succeeds only when the test cases one by one.
describe('Read relationships with status', () => {
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

    // status: 1 means friend relationship within two users
    it('Show friends - GET /relationship/status/:ACCEPTED returns 200', done => {
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
        RelationshipController.update(query, options, (err, result) => {
            if (result.n) {
                assert.ok('Success to update status ACCEPTED');
            } else {
                assert.ok('Fail to update status ACCEPTED');
            }
        });

        // var friends;
        // get user info by id
        // and set the response body, 'friends'
        request
            .get('/relationship/status/' + RelationshipController.statusValues.ACCEPTED)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                res.body.should.have.property('friends');
                done();
            });
    });

    // status: 0 means pending status
    it('Show friends - GET /relationship/status/:ACCEPTED returns 404', done => {
        request
            .get('/relationship/status/' + RelationshipController.statusValues.ACCEPTED)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(404);
                done();
            });
    });

    it('Read Pending requests - GET /relationship/status/:PENDING returns 200', done => {
        request
            .get('/relationship/status/' + RelationshipController.statusValues.PENDING)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                res.body.should.have.property('fromUsers');
                done();
            });
    });

    it('Read Pending requests - GET /relationship/status/:PENDING returns 404', done => {

        RelationshipController.deleteAll(err => {
        });

        request
            .get('/relationship/status/' + RelationshipController.statusValues.PENDING)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(404);
                done();
            });
    });

    it('Wrong status value - GET /relationship/status/:anynumbers returns 400', done => {
        request
            .get('/relationship/status/' + 4)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(400);
                done();
            });
    })
});

describe('Response to the friend request', () => {
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

    it('Accept - PUT /relationship/fromUser/:id/accepted', done => {
        request
            .put('/relationship/fromUser/' + otherUser.id + '/accepted')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });

    it('Declined - DELETE /relationship/fromUser/:id/declined', done => {
        request
            .delete('/relationship/fromUser/' + otherUser.id + '/declined')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });

    it('Declined - DELETE /relationship/fromUser/:id/declined with id which is not exists return 400', done => {
        request
            .delete('/relationship/fromUser/' + 'wrongId' + '/declined')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(400);
                done();
            });
    });
});

describe('Remove a friend', () => {
    let loggedInUser;
    let friend;
    let accessToken;
    let fromUserId;
    let status;
    before(done => {
        // Create two users
        // Create over 1 token
        // Create over 1 relationship - {'a', 'b', ACCEPTED} means friend relationship
        User.createMany((err, users) => {
            if (users.length === 2) {
                loggedInUser = users[0];
                friend = users[1];
            }
            Token.create(clientId, loggedInUser.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;

                RelationshipController.create(loggedInUser.id, friend.id, (err, newRelationship, info) => {
                    // Set status to ACCEPTED and save again
                    newRelationship.status = RelationshipController.statusValues.ACCEPTED;
                    newRelationship.save(err => {
                        done();
                    });
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

    it('DELETE /relationship/friend/:id', done => {
        // Check if the friend relationship exists in db
        const query = {
            $or: [
                {fromUserId: loggedInUser.id, toUserId: friend.id},
                {fromUserId: friend.id, toUserId: loggedInUser.id}
            ],
            status: RelationshipController.statusValues.ACCEPTED
        };
        Relationship.find(query, (err, relationships) => {
            if(relationships.length !== 0) console.log(relationships);
            else {
                console.log('no relationships');
            }
        });

        request
            .delete('/relationship/friend/' + friend.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });
    it('DELETE /relationship/friend/:id with worngid returns 400', done => {
        request
            .delete('/relationship/friend/' + 'wrongId')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(400);
                done();
            });
    });
});
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