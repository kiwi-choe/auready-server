process.env.dbURI = 'test';

const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');
const test_name = 'nameofkiwi3';
const test_email = 'kiwi3@gmail.com';
const test_password = '123';

const search = 'kiwi';
describe('GET /user/:search', () => {

    let accessToken;
    before(done => {
        // Register user first
        User.create(test_name, test_email, test_password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
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


    it('GET /user/:search - should return 200 code', done => {
        request
            .get('/user/' + search)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });
});