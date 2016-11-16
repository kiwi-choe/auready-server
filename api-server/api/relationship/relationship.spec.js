process.env.dbURI = 'test';

const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');

describe('POST /relationship/', () => {

    let accessToken;
    let loggedinuser;
    let otheruser;
    before(done => {
        // Create logged in user and other user
        User.createMany((err, users) => {
            if(users.length === 2) {
                loggedinuser = users[0];
                otheruser = users[1];
            }
            Token.create(clientId, loggedinuser.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
            });s
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
