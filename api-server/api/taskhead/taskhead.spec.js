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

const TaskHeadController = require('../../../models/taskhead.controller');
const TaskHead = require('../../../models/taskhead');
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

describe('There is a taskHead in DB for UPDATE, DELETE test', () => {

    let accessToken;
    const taskHeadInfo = {
        title: test_title,
        members: test_members,
        order: test_order
    };
    let taskHead;
    beforeEach(done => {
        // Create user first
        User.create(name, email, password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                TaskHeadController.create(taskHeadInfo, (err, newTaskHead) => {
                    taskHead = newTaskHead;
                    done();
                });
            });
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                TaskHeadController.deleteAll(err => {
                    done();
                });
            });
        });
    });

    it('DELETE /taskhead/:id returns 200', done => {
        request
            .delete('/taskhead/' + taskHead.id)
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });
    it('DELETE /taskhead/wrongId returns 400', done => {
        request
            .delete('/taskhead/' + 'wrongId')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(400);
                done();
            });
    });


    it('PUT /taskhead/', done => {
        const updatingTaskHead = {
            _id: taskHead.id,
            title: 'changeTitle',
            members: ['changeMember1', 'changeMember2'],
            order: 5
        };
        request
            .put('/taskhead/')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .send({taskHead: updatingTaskHead})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                // res.body.should.have.property('taskHead');
                done();
            });
    });
});

/*
* TaskHead DB test TODO separate the below tests
* */
describe('[taskhead DB test]', () => {
    after(done => {
        TaskHeadController.deleteAll(err => {
            done();
        });
    });

    it('Create a taskhead', done => {

        const taskHeadInfo = {
            title: test_title,
            members: test_members,
            order: test_order
        };
        TaskHeadController.create(taskHeadInfo, (err, newTaskHead) => {
            if (newTaskHead) {
                taskHead = newTaskHead;
            }
            done();
        });
    });
});

describe('[taskhead DB test]: There is a taskhead in DB for UPDATE, DELETE test', () => {

    let accessToken;
    const taskHeadInfo = {
        title: test_title,
        members: test_members,
        order: test_order
    };
    let taskHead;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                TaskHeadController.create(taskHeadInfo, (err, newTaskHead) => {
                    taskHead = newTaskHead;
                    done();
                });
            });
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                TaskHeadController.deleteAll(err => {
                    done();
                });
            });
        });
    });

    it('DELETE a taskhead', done => {
        TaskHeadCon.delete(taskHead.id, (err, isRemoved) => {
            assert.ifError(err);
            console.log('\n' + isRemoved);
            done();
        });
    });

    it('Update taskhead', done => {
        const updatingTaskHead = {
            title: 'changeTitle',
            members: ['changeMember1', 'changeMember2'],
            order: 5
        };
        TaskHeadController.update({_id: newTaskHead.id}, updatingTaskHead, (err,result) => {
            if(err) {
                assert.ifError(err);
            }
            if(!result.n) {
                assert.fail();
            }
            // Find updated taskhead
            TaskHead.findOne({_id: newTaskHead.id}, (err, taskhead) => {
                assert.equal(taskhead.title, updatingTaskHead.title);

                done();
            });
        });
    });
});
