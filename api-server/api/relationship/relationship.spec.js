process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

const User = require('../../../models/user.controller');

const RelationshipController = require('../../../models/relationship.controller.js');
const Relationship = require('../../../models/relationship');

describe('FriendRequest - POST /relationships/:toUserId', () => {

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
                RelationshipController.deleteAll(err => {
                    done();
                });
            });
        });
    });

    it('new request - should return 201 code', done => {
        request
            .post('/relationships/' + otheruser.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(201)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(201);
                done();
            });
    });

    it('duplicating friendRequest, should return 409 code', done => {
        RelationshipController.create(loggedinuser.id, otheruser.id, (err, relationship, info) => {
        });
        request
            .post('/relationships/' + otheruser.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(409)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(409);
                done();
            });
    });

});

describe('Check the relationship - GET /relationships/user/:userId', () => {

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
            .get('/relationships/' + otherUser.id)
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
            .get('/relationships/' + otherUser.id)
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
    it('Show friends - GET /relationships/status/:ACCEPTED returns 200', done => {
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
            .get('/relationships/status/' + RelationshipController.statusValues.ACCEPTED)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                res.body.should.have.property('friends');
                done();
            });
    });

    it('no friends - GET /relationships/status/:ACCEPTED returns 204', done => {
        request
            .get('/relationships/status/' + RelationshipController.statusValues.ACCEPTED)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(204)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(204);
                done();
            });
    });

    // status: 0 means pending status
    it('Read Pending requests - GET /relationships/status/:PENDING returns 200', done => {
        request
            .get('/relationships/status/' + RelationshipController.statusValues.PENDING)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                res.body.should.have.property('fromUsers');
                done();
            });
    });

    it('Read Pending requests - GET /relationships/status/:PENDING returns 404', done => {

        RelationshipController.deleteAll(err => {
        });

        request
            .get('/relationships/status/' + RelationshipController.statusValues.PENDING)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(404)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(404);
                done();
            });
    });

    it('Wrong status value - GET /relationships/status/:anynumbers returns 400', done => {
        request
            .get('/relationships/status/' + 4)
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

    it('Accept - PUT /relationships/fromUser/:id/accepted', done => {
        request
            .put('/relationships/fromUser/' + otherUser.id + '/accepted')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });

    it('Declined - DELETE /relationships/fromUser/:id/declined', done => {
        request
            .delete('/relationships/fromUser/' + otherUser.id + '/declined')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });

    it('Declined - DELETE /relationships/fromUser/:id/declined with id which is not exists return 400', done => {
        request
            .delete('/relationships/fromUser/' + 'wrongId' + '/declined')
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

    it('DELETE /relationships/friend/:id', done => {
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
            .delete('/relationships/friend/' + friend.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });
    it('DELETE /relationships/friend/:id with worngid returns 400', done => {
        request
            .delete('/relationships/friend/' + 'wrongId')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(400);
                done();
            });
    });
});