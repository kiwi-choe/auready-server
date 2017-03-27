// Change dbURI
process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

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

const FCM = require('fcm-push');
const serverkey = predefine.fcmServerKey.key;
const fcm = new FCM(serverkey);

const instanceID = predefine.test_instanceID;

const message = {
    to: instanceID,
    data: {
        your_custom_data_key: 'your_custom_data_value'
    },
    notification: {
        title: 'Hi kiwi',
        body: 'This is the test for notification!'
    }
};

describe('fcm test', () =>{

    it('send?', done => {
        fcm.send(message, (err, res) => {
            if(err) {
                console.log('something has gone wrong!');
            } else {
                console.log('Successfully sent with response:', res);
            }

            done();
        });
    });

});
