process.env.dbURI = 'test';

const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const UserController = require('../../../models/user.controller');
const User = require('../../../models/user');
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
                if(i === savedUsers.length-1) {
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