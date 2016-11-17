process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');

const RelationshipController = require('../../../models/relationship.controller');
const Relationship = require('../../../models/relationship');

describe('POST /relationship/', () => {

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

    it('POST /:userId (Add a relationship) should return 201 code', done => {
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

describe('GET /relationship/', () => {

    // conditions
    // 1. 2 users at least
    // 2. a relationship with status 0:pending - requested to be a friend
    let accessToken;
    let loggedInUser;
    let otherUser;
    before(done => {
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
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });

    it('Check the relationship - GET /relationship/:userId', done => {
        request
            .get('/relationship/' + otherUser.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // can check what relationship with 'otherUser.id' using 'actionUserId' and 'status'
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
                if(relationship) {
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