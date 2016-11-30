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

const TaskController = require('../../../models/task.controller');
const Task = require('../../../models/task');
const taskObj = {
    order: 1,
    createdTime: 12345,
    description: 'description',
    detailNote: 'detailnote',
    completed: ['member1', 'member2']
};
const TaskHeadController = require('../../../models/taskhead.controller');
const TaskHead = require('../../../models/taskhead');
const test_title = 'titleOfTaskHead';
const test_members = ['member1', 'member2', 'member3'];
const test_order = 0;

describe('Task', () => {
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

    describe('POST /task', () => {
        it('it should not POST a task without taskHeadId field and returns 400', done => {
            let newTask = taskObj;
            newTask.taskHeadId = undefined;
            request
                .post('/task')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({taskInfo: newTask})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });
        it('it should POST a task and returns 201', done => {
            request
                .post('/task')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({taskHeadId: taskHead.id, taskInfo: taskObj})
                .expect(201)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('DELETE or PUT /task', () => {
        let task;
        beforeEach(done => {
            TaskHeadController.createTask(taskHead.id, taskObj, (err, updatedTaskHead) => {
                task = updatedTaskHead.tasks[0];
                console.log(task);
                done();
            });
        });
        it('it should DELETE all tasks', done => {
            request
                .delete('/task')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });
        it('it should DELETE a task by given id', done => {
            request
                .delete('/task/' + task.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });

        it('it should UPDATE a task by given id', done => {
            let updatingTask = task;
            updatingTask.description = 'changedDescription';
            request
                .put('/task/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({task: updatingTask})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    // res.body.description.should.be.equal(updatingTask.description);
                    done();
                });
        });
    });
});

describe('Task DB', () => {
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

    describe('CREATE a task', () => {
        it('A task is created', done => {
            TaskController.create(taskObj, (err, newTask) => {
                assert.ifError(err);
                if (newTask) {
                    assert.equal(newTask.description, taskObj.description, 'success to create');
                } else {
                    assert.fail('fail to create a task');
                }
                done();
            });
        });
    });

    describe('EDIT tasks', () => {
        let task;
        beforeEach(done => {
            TaskController.create(taskObj, (err, newTask) => {
                task = newTask;
                done();
            });
        });
        afterEach(done => {
            TaskController.deleteAll(err => {
                done();
            });
        });

        it('DELETE all tasks', done => {
            TaskController.deleteAll((err) => {
                assert.ifError(err);
                done();
            });
        });
        it('DELETE a task', done => {
            TaskController.delete(task.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');
                done();
            });
        });

        it('UPDATE a task', done => {
            let updatingTask = taskObj;
            updatingTask.description = 'changedDescription';
            TaskController.update({_id: task.id}, updatingTask, (err, result) => {
                assert.ifError(err);
                (result.n).should.be.equal(1);
                Task.findOne({_id: task.id}, (err, updatedTask) => {
                    (updatedTask.description).should.be.equal(updatingTask.description);
                    done();
                });
            });
        });
    });

    describe('GET task by id', () => {
        let task;
        const taskHeadInfo = {
            title: test_title,
            members: test_members,
            order: test_order
        };
        let taskHeadInfo2 = taskHeadInfo;
        before(done => {
            TaskHeadController.create(taskHeadInfo, (err, newTaskHead) => {
                taskHeadInfo2.title = 'changedTitle!!!';
                TaskHeadController.create(taskHeadInfo2, (err, newTaskHead2) => {
                    console.log('newTaskHead=====================');
                    console.log(newTaskHead);
                    console.log('newTaskHead 2=====================');
                    console.log(newTaskHead2);

                    TaskHeadController.createTask(newTaskHead.id, taskObj, (err, updatedTaskHead) => {

                        task = updatedTaskHead.tasks[0];
                        console.log(updatedTaskHead);
                        done();
                    });
                });
            });
        });
        after(done => {
            TaskHeadController.deleteAll(err => {
                done();
            });
        });
        it('One task should be find', done => {
            // TaskHead.findOne({'tasks._id': task.id}, (err, taskHead) => {
            //     console.log('\n===========================');
            //     console.log(taskHead);
            //     done();
            // });
            TaskHeadController.updateTask(task, (err, taskHead) => {
                console.log('\n===========================');
                console.log(taskHead);
                done();
            });
        });
    });
});