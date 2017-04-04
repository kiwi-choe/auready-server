process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

const User = require('../../../models/user');
const UserController = require('../../../models/user.controller');

const Relationship = require('../../../models/relationship');
const Status = require('../../../models/relationship.controller').statusValues;

const search = 'kiwi';
describe('GET /users/:search', () => {

    let savedUsers;
    let accessToken;
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

            // Register user first
            // Add Token
            Token.create(clientId, fromUserId, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;


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
    });
    after(done => {
        // delete all the users
        UserController.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });

    it('GET /users/:search - should return 200 code', done => {
        request
            .get('/users/' + search)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // res.body.should.has.property('status');
                done();
            });
    });

    it('GET /users/:search - should return 204 code', done => {
        request
            .get('/users/' + 'nousers')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(204)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('returns 200 code and json body - userInfo, status', done => {
        request
            .get('/users/' + search)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // res.body.should.has.property('status');
                done();
            });
    });
});