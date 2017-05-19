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
    {id: 'stubbedTaskId0', description: 'des', completed: false, order: 0},
    {id: 'stubbedTaskId1', description: 'des1', completed: false, order: 0},
    {id: 'stubbedTaskId2', description: 'des2', completed: false, order: 0}
];
const test_tasks1 = [
    {id: 'stubbedTaskId3', description: 'des3', completed: false, order: 0},
    {id: 'stubbedTaskId4', description: 'des4', completed: false, order: 0},
    {id: 'stubbedTaskId5', description: 'des5', completed: false, order: 0}
];
const test_members = [
    {id: 'stubbedMemberId0', name: 'member0', email: 'email_member0', tasks: test_tasks},
    {id: 'stubbedMemberId1', name: 'member1', email: 'email_member1', tasks: test_tasks}
];
const test_taskhead = {
    id: 'stubbedTaskHeadId',
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

        it('DELETE /tasks/:id returns 200', done => {
            const deletingTaskId = savedTasks[0].id;
            request
                .delete('/tasks/' + deletingTaskId)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('DELETE a task - deletingTaskId is wrong id - returns 400', done => {
            request
                .delete('/tasks/' + 'wrong id')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /tasks/ - no params returns 400', done => {
            request
                .put('/tasks/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /tasks/:taskheadid 1 returns 200', done => {
            const updatingTasks = [
                {id: test_tasks[0].id, description: 'updating DES0', completed: false, order: 0},
                {id: test_tasks[1].id, description: 'updating DES1', completed: false, order: 0}];
            const updatingTasks1 = [
                {id: test_tasks1[0].id, description: 'updating DES3', completed: false, order: 0},
                {id: test_tasks1[1].id, description: 'updating DES4', completed: false, order: 0}];
                const memberTasks = [
                    {memberid: test_members[0].id, tasks: updatingTasks},
                    {memberid: test_members[1].id, tasks: updatingTasks1}
                ];
            request
                .put('/tasks/' + test_taskhead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send(memberTasks)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('PUT /tasks/?memberid= memberid value returns 200', done => {
            const updatingTasks = [
                {id: test_tasks[0].id, description: 'updating DES0', completed: false, order: 0},
                {id: test_tasks[1].id, description: 'updating DES1', completed: false, order: 0}];

            request
                .put('/tasks/?memberid=' + test_members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send(updatingTasks)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
        it('PUT /tasks/?memberid= returns 404', done => {
            request
                .put('/tasks/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(404);
                    done();
                });
        });

        it('GET /tasks/:memberid returns 200', done => {
            request
                .get('/tasks/' + test_members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
    });
});