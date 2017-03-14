// Change dbURI
process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');
const name = 'nameofkiwi1';
const email = 'kiwi1@gmail.com';
const password = '123';

describe('This test needs the accessToken to access API resources', () =>{
    let accessToken;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
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
                console.log('users are removed');
                done();
            });
        });
    });

    describe('Register the instanceId', () => {

        const instanceId = 'stub_instanceId';
        it('POST /notifications/:instanceId returns 201', done => {
            request
                .post('/notifications/' + instanceId)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(201)
                .end(err => {
                    if (err) throw err;
                    done();
                });
        });
    });

});