process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
require('../../../www');

const User = require('../../../models/user');
const UserController = require('../../../models/user.controller');

const Relationship = require('../../../models/relationship');
const RelationshipController = require('../../../models/relationship.controller');
const Status = RelationshipController.statusValues;

/*
 * DB test
 * */
describe('Read', () => {

    let savedUsers;
    const stubbedInstanceId = 'stub_instanceId';
    before(done => {
        const userArr = [
            {name: 'nameofkiwi1', email: 'kiwi1@gmail.com', password: '123', instanceId: stubbedInstanceId},
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

    it('get an instanceId by an userId', done => {
        const userId = savedUsers[0]._id;
        User.findOne({_id: userId}, (err, user) => {
            if(err) throw err;
            assert.equal(user.instanceId, stubbedInstanceId);
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

            // Create relationships of 'the logged in user'
            let fromUserId = savedUsers[0]._id;
            console.log('\n---------------\nfromUser name - ', savedUsers[0].name);

            let newRelationShip1 = new Relationship();
            newRelationShip1.fromUserId = fromUserId;
            newRelationShip1.toUserId = savedUsers[1]._id;
            newRelationShip1.status = Status.PENDING;

            let newRelationShip2 = new Relationship();
            newRelationShip2.fromUserId = fromUserId;
            newRelationShip2.toUserId = savedUsers[2]._id;
            newRelationShip2.status = Status.ACCEPTED;

            newRelationShip1.save(err => {
                if (err) {
                    assert.fail('fail to create new relationship1');
                }
                newRelationShip2.save(err => {
                    if (err) {
                        assert.fail('fail to create new relationship2');
                    }
                    done();
                });
            });


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
            if (!users) {
                console.log('no users');
                done();
            }
            // check that logged in user id and found users are in relationship collection
            users.forEach((user, i) => {

                RelationshipController.readStatus(loggedInUserId, user.id, (err, status) => {
                    if (err) {
                        assert.fail('err when find relationship');
                        done();
                    }
                    // Make array
                    let userAndStatus = {user: String, status: Number};
                    userAndStatus.user = user;
                    if (status === Status.NO_STATUS || status === Status.PENDING) {
                        userAndStatus.status = status;
                    }
                    else {
                        console.log('already friends');
                        return;
                    }
                    userAndStatusArr.push(userAndStatus);

                    if (users.length - 1 === i) {
                        // returns array of 'user' and 'status'
                        console.log('\nuserAndStatusArr - ', userAndStatusArr);
                        assert.equal(userAndStatusArr.length, 3);
                        done();
                    }
                });
            });
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

describe('Update', () => {

    let savedUser;
    before(done => {
        const user = {name: 'nameofkiwi1', email: 'kiwi1@gmail.com', password: '123', isLocalAccount: true};
        // create 4 users
        UserController.create(user.name, user.email, user.password, user.isLocalAccount, (err, newUser) => {
            savedUser = newUser;
            console.log('savedUser- ', savedUser);
            done();
        });
    });

    it('update instanceId field', done => {
        let instanceId = 'stub_instanceId';
        UserController.updateInstanceId(savedUser.id, instanceId, (err, updatedUser) => {
            if(err) {
                assert.ifError(err);
            }
            if(!updatedUser) {
                assert.fail('isupdated is false');
            }
            console.log('\nupdatedUser- ', updatedUser);
            done();
        });
    });

    after(done => {
        // delete all the users
        UserController.deleteAll(err => {
            done();
        });
    });
});
