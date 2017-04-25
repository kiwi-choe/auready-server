process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

const User = require('../../../models/user.controller');
const name = 'nameofkiwi3';
const email = 'kiwi3@gmail.com';
const password = '123';

const TaskHeadDBController = require('../../../models/task/taskhead.controller.js');
const test_tasks = [
    {description: 'des', completed: false, order: 0},
    {description: 'des1', completed: false, order: 0},
    {description: 'des2', completed: false, order: 0}
];
const test_members = [
    {id: 'stubbedMemberId', name: 'member1', email: 'email_member1', tasks: test_tasks}
];
const test_taskhead = {
    title: 'titleOfTaskHead',
    members: test_members
};

const TaskController = require('../../../models/task/task.controller.js');

const taskObj = {
    id: 'stubbedTaskId',
    description: 'desUPDATE!!!!!',
    completed: true,
    order: 0
};

describe('Task - need the accessToken to access API resources and pre saved TaskHeadDBController', () => {
    let accessToken;
    let savedTaskHead;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                TaskHeadDBController.create(test_taskhead, (err, newTaskHead) => {
                    savedTaskHead = newTaskHead;
                    done();
                });
            });
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                TaskHeadDBController.deleteAll(err => {
                    done();
                });
            });
        });
    });

    describe('POST /tasks', () => {
        it('it should not POST a task without memberId field and returns 400', done => {
            request
                .post('/tasks/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({task: taskObj})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });
        it('it should POST a task and returns 201', done => {

            const taskInfo = {
                id: taskObj.id,
                description: taskObj.description,
                completed: taskObj.completed,
                order: taskObj.order
            };
            request
                .post('/tasks/' + savedTaskHead.members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send(taskInfo)
                .expect(201)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(201);
                    done();
                });
        });
    });

    describe('DELETE or PUT /tasks', () => {
        let savedTasks = [];
        beforeEach(done => {
            // Remove All tasks of taskhead
            savedTasks.length = 0;
            TaskController.deleteAll(savedTaskHead.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');

                // Create 3 tasks
                test_tasks.forEach((task, i) => {
                    TaskController.create(savedTaskHead.members[0].id, task, (err, newTask) => {
                        savedTasks.push(newTask);

                        if (test_tasks.length - 1 === i) {
                            assert.equal(savedTasks.length, 3);
                            done();
                        }
                    });
                });

            });
        });

        it('DELETE /tasks/ returns 200', done => {
            let deletingTaskIds = [];
            deletingTaskIds.push(savedTasks[0].id);
            deletingTaskIds.push(savedTasks[2].id);

            request
                .delete('/tasks/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .send({ids: deletingTaskIds})
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('DELETE tasks - deletingTaskIds is undefined - returns 400', done => {
            request
                .delete('/tasks/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /tasks/:id returns 404 - with wrong task id', done => {
            request
                .put('/tasks/' + 'wrongid')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({task: taskObj})
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(404);
                    done();
                });
        });

        it('PUT /tasks/:id of index 1 returns 200', done => {
            request
                .put('/tasks/' + savedTasks[1].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({task: taskObj})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
    });
});