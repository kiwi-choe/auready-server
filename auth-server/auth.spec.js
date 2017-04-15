process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../www');
const request = require('supertest')(server);

const User = require('../models/user.controller');
const test_name = 'nameofkiwi3';
const test_email = 'kiwi3@gmail.com';
const test_password = '123';

const Token = require('../models/token.controller');
const predefine = require('../predefine');
const trustedClientInfo = predefine.trustedClientInfo;

const config = {

    headerForReqAuth: {
        Authorization: predefine.authHeader.basic
    },

    bodyForAuthLocal: {
        grant_type: 'password',
        username: test_email,
        password: test_password
    }
};

// Local
describe('POST /auth/token', () => {

    before(done => {
        // register user
        User.create(test_name, test_email, test_password, true, (err, user, info) => {
            done();
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            done();
        });
    });

    it('should return 200 code and return access token', done => {
        request
            .post('/auth/token')
            .set(config.headerForReqAuth)
            .send(config.bodyForAuthLocal)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.properties('access_token', 'expires_in', 'refresh_token', 'user_info');
                done();
            });
    });

    it('should return 401(Unauthorized) code without Authorization header', done => {
        request
            .post('/auth/token')
            .send(config.bodyForAuthLocal)
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe('DELETE /auth/token', () => {

    let accessToken;
    beforeEach(done => {
        // Register user first
        User.create(test_name, test_email, test_password, true, (err, user, info) => {
            // Add Token
            Token.create(trustedClientInfo.clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
            });
        });
    });
    afterEach(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });

    it('should return 200 code', done => {
        request
            .delete('/auth/token/' + accessToken)
            .set({Authorization: 'Bearer ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('should return 204 code with params including wrong value', done => {
        request
            .delete('/auth/token/' + "wrong value")
            .set({Authorization: 'Bearer ' + accessToken})
            .expect(204)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('should return 401(Unauthorized) code without Authorization header', done => {
        request
            .delete('/auth/token/' + "something")
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('should return 403(Unauthorized) code with the wrong access token', done => {
        request
            .delete('/auth/token/' + "something")
            .set({Authorization: 'Bearer ' + 'wrong_access_token'})
            .expect(403)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

