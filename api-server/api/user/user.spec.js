process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user');
const UserController = require('../../../models/user.controller');

const Relationship = require('../../../models/relationship');
const RelationshipController = require('../../../models/relationship.controller');

const test_name = 'nameofkiwi3';
const test_email = 'kiwi3@gmail.com';
const test_password = '123';

const search = 'kiwi';
describe('GET /user/:search', () => {

    let accessToken;
    before(done => {
        // Register user first
        UserController.create(test_name, test_email, test_password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
            });
        });
    });
    after(done => {
        // delete all the users
        UserController.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });

    it('GET /user/:search - should return 200 code', done => {
        request
            .get('/user/' + search)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // res.body.should.has.property('status');
                done();
            });
    });

    it('GET /user/:search - should return 204 code', done => {
        request
            .get('/user/' + 'nousers')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(204)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

/*
 * DB test
 * */
describe('Read', () => {

    let savedUsers;
    before(done => {

        const userArr = [
            {name: 'nameofkiwi1', email: 'kiwi1@gmail.com', password: '123'},
            {name: 'nameofkiwi2', email: 'kiwi2@gmail.com', password: '123'},
            {name: 'nameofkiwi3', email: 'kiwi3@gmail.com', password: '123'},
            {name: 'nameofkiwi4', email: 'kiwi4@gmail.com', password: '123'}];
        // create 4 users
        User.insertMany(userArr, (err, users) => {
            savedUsers = users;
            done();
        });
    });

    it('get users by userIds', done => {
        let foundUsers = [];
        savedUsers.forEach((savedUser, i) => {
            User.findOne({_id: savedUser._id}, (err, user) => {
                if (err) throw err;
                foundUsers.push(user);
                if (i === savedUsers.length - 1) {
                    console.log(foundUsers);
                }
            });
        });
        done();
    });


    after(done => {
        // delete all the users
        UserController.deleteAll(err => {
            done();
        });
    });
});

describe('Read users with Relationship', () => {
    let savedUsers;
    before(done => {
        const userArr = [
            {name: 'nameofkiwi1', email: 'kiwi1@gmail.com', password: '123'},
            {name: 'nameofkiwi2', email: 'kiwi2@gmail.com', password: '123'},
            {name: 'nameofkiwi3', email: 'kiwi3@gmail.com', password: '123'},
            {name: 'nameofkiwi4', email: 'kiwi4@gmail.com', password: '123'}];
        // create 4 users
        User.insertMany(userArr, (err, users) => {
            savedUsers = users;

            // Create relationship of 'the logged in user' and 'one of user'
            let fromUserId = savedUsers[0]._id;
            console.log('\n---------------\nfromUser name - ', savedUsers[0].name);
            let toUserId = savedUsers[1]._id;
            console.log('toUser name - ', savedUsers[1].name);
            // relationship of fromUser and toUser
            let relationshipId;
            RelationshipController.create(fromUserId, toUserId, (err, newRelationship) => {

                if (newRelationship) {
                    relationshipId = newRelationship.id;
                    console.log(relationshipId);
                } else {
                    console.log('failed to create a new relationship');
                }
                done();
            });
        });
    });

    it('get users and status of each users by emailOrName', done => {

        // get users by emailOrName
        let loggedInUserId = savedUsers[0]._id;
        let search = 'kiwi';
        UserController.readByEmailOrName(search, (err, users) => {
            if (err) {
                assert.fail('err', err);
            }
            if (users) {
                // check that logged in user id and found users are in relationship collection
                users.forEach((user, i) => {
                    Relationship.findOne().or([
                        {fromUserId: loggedInUserId, toUserId: user.id},
                        {fromUserId: user.id, toUserId: loggedInUserId},
                    ]).exec((err, relationship) => {
                        if (err) {
                            assert.fail('err when find relationship');
                            done();
                        }
                        if (!relationship) {
                            console.log('\n no relationship with ', user.name);
                        } else {
                            console.log('\n status of ', user.name, ' is ', relationship.status);
                        }

                        if (users.length - 1 === i) {
                            // returns 'users' and 'status of each users'

                            done();
                        }
                    });
                });
            }
        });
    });

    it('make the return value - users and the status of each users array', done => {

        let userAndStatusArr = [];
        userAndStatusArr.length = 0;
        // get users by emailOrName
        let loggedInUserId = savedUsers[0]._id;
        let search = 'kiwi';
        UserController.readByEmailOrName(search, (err, users) => {
            if (err) {
                assert.fail('err', err);
            }
            if (users) {
                // check that logged in user id and found users are in relationship collection
                users.forEach((user, i) => {
                    Relationship.findOne().or([
                        {fromUserId: loggedInUserId, toUserId: user.id},
                        {fromUserId: user.id, toUserId: loggedInUserId},
                    ]).exec((err, relationship) => {
                        if (err) {
                            assert.fail('err when find relationship');
                            done();
                        }

                        // Make array
                        let userAndStatus = {user: String, status: Number};
                        userAndStatus.user = user;
                        if (relationship) {
                            userAndStatus.status = relationship.status;
                        } else {
                            userAndStatus.status = null;
                        }
                        userAndStatusArr.push(userAndStatus);

                        if (users.length - 1 === i) {
                            // returns 'users' and 'status of each users'
                            console.log('\nuserAndStatusArr - ', userAndStatusArr);
                            done();
                        }
                    });
                });

            }
        });
    });

    describe('Create relationship - two relationships with 1 couples', () => {
        before(done => {
            // Create relationship of 'the logged in user' and 'one of user'
            let fromUserId = savedUsers[1]._id;
            console.log('\n---------------\nfromUser name - ', savedUsers[1].name);
            let toUserId = savedUsers[0]._id;
            console.log('toUser name - ', savedUsers[0].name);
            // relationship of fromUser and toUser
            let relationshipId;
            RelationshipController.create(fromUserId, toUserId, (err, newRelationship) => {
                if (newRelationship) {
                    relationshipId = newRelationship.id;
                    console.log(relationshipId);
                } else {
                    console.log('failed to create a new relationship');
                }
                done();
            });
        });

        it('get users and status of each users by emailOrName', done => {

            // get users by emailOrName
            let loggedInUserId = savedUsers[0]._id;
            let search = 'kiwi';
            UserController.readByEmailOrName(search, (err, users) => {
                if (err) {
                    assert.fail('err', err);
                }
                if (users) {
                    // check that logged in user id and found users are in relationship collection
                    users.forEach((user, i) => {
                        Relationship.findOne().or([
                            {fromUserId: loggedInUserId, toUserId: user.id},
                            {fromUserId: user.id, toUserId: loggedInUserId},
                        ]).exec((err, relationship) => {
                            if (err) {
                                assert.fail('err when find relationship');
                                done();
                            }
                            if (!relationship) {
                                console.log('\n no relationship with ', user.name);
                            } else {
                                console.log('\n status of ', user.name, ' is ', relationship.status);
                            }

                            if (users.length - 1 === i) {
                                // returns 'users' and 'status of each users'

                                done();
                            }
                        });
                    });

                }
            });
            // this test invokes the warning that
            // this relationship already exists and failed to create a new relationship
        });
    });

    it('test RelationshipController method - readStatus', done => {
        let userAndStatusArr = [];
        userAndStatusArr.length = 0;
        // get users by emailOrName
        let loggedInUserId = savedUsers[0]._id;
        let search = 'kiwi';
        UserController.readByEmailOrName(search, (err, users) => {
            if (err) {
                assert.fail('err', err);
            }
            if (users) {
                // check that logged in user id and found users are in relationship collection
                users.forEach((user, i) => {
                    RelationshipController.readStatus(loggedInUserId, user.id, (err, status) => {
                        // Make array
                        let userAndStatus = {user: String, status: Number};
                        userAndStatus.user = user;
                        userAndStatus.status = status;
                        userAndStatusArr.push(userAndStatus);

                        if (users.length - 1 === i) {
                            // returns 'users' and 'status of each users'
                            console.log('\nuserAndStatusArr - ', userAndStatusArr);
                            done();
                        }
                    });
                });

            }
        });
    });

    after(done => {
        RelationshipController.deleteAll(err => {
            // delete all the users
            UserController.deleteAll(err => {
                done();
            });
        });
    });

});
