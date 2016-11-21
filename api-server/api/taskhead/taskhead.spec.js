process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../auth-server/util/predefine');
const clientId = 'tEYQAFiAAmLrS2Dl';

const User = require('../../../models/user.controller');
const name = 'nameofkiwi3';
const email = 'kiwi3@gmail.com';
const password = '123';

const TaskHead = require('../../../models/taskhead.controller');
const test_title = 'titleOfTaskHead';
const test_members = ['member1', 'member2', 'member3'];
const test_order = 0;

describe('Create a new taskHead', () => {

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
                done();
            });
        });
    });

    it('POST /taskhead/', done => {
        request
            .post('/taskhead/')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .send({
                taskHeadInfo: {title: test_title, members: test_members, order: test_order}
            })
            .expect(201)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe('Taskhead DB test', () => {
    after(done => {
        TaskHead.deleteAll(err => {
            done();
        });
    });

    it('Create a taskhead', done => {
        TaskHead.create(test_title, test_members, test_order, (err, taskhead) => {

            assert.ifError(err);
            if (!taskhead) {
                assert.notEqual(taskhead.title, test_title, 'created');
            }
            assert.equal(taskhead.title, test_title, 'created');
            done();
        });
    });
});