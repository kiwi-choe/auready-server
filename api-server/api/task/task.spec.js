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

const TaskHead = require('../../../models/task/taskhead.controller.js');
const test_tasks = [
    {order: 0, description: 'des', detailNote: 'detailnote', completed: false},
    {order: 1, description: 'des1', detailNote: 'detailnote1', completed: false},
    {order: 2, description: 'des2', detailNote: 'detailnote2', completed: false},
    {order: 3, description: 'des3', detailNote: 'detailnote3', completed: false}
];
const test_members = [
    {name: 'member1', email: 'email_member1', tasks: test_tasks}
];
const test_taskhead = {
    title: 'titleOfTaskHead',
    order: [
        {member: 'member1', order: 0}
    ],
    members: test_members
};

const TaskController = require('../../../models/task/task.controller.js');

const taskObj = {
    order: 555,
    description: 'desNew',
    detailNote: 'detailnoteNew',
    completed: false
};

describe('Task', () => {
    let accessToken;
    let taskHead;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                TaskHead.create(test_taskhead, (err, newTaskHead) => {
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
                TaskHead.deleteAll(err => {
                    done();
                });
            });
        });
    });

    describe('POST /task', () => {
        it('it should not POST a task without taskHeadId field and returns 400', done => {
            request
                .post('/task')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({task: taskObj})
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
                .send({memberid: taskHead.members[0].id, task: taskObj})
                .expect(201)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(201);
                    done();
                });
        });
    });

    describe('DELETE or PUT /task', () => {
        let task;
        beforeEach(done => {
            TaskHead.createTask(taskHead.id, taskObj, (err, updatedTaskHead) => {
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
    let taskHead;
    before(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            // Create a Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                // Create a TaskHead
                TaskHead.create(test_taskhead, (err, newTaskHead) => {
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
                TaskHead.deleteAll(err => {
                    done();
                });
            });
        });
    });

    describe('CREATE a task', () => {
        it('A task is created', done => {
            TaskController.create(taskHead.id, taskHead.members[0].id, taskObj, (err, newTask) => {
                assert.ifError(err);
                if (newTask) {
                    console.log(newTask);
                    // const lenOfTasks = taskHeadOfNewTask.members[0].tasks.length;
                    // console.log('\n' + taskHeadOfNewTask.members[0].tasks[lenOfTasks-1].description);
                    assert.equal(newTask.description, taskObj.description, 'not equal description');
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
            TaskController.create(taskHead.id, taskHead.members[0].id, taskObj, (err, newTask) => {
                task = newTask;
                done();
            });
        });
        afterEach(done => {
            // Remove All tasks of taskhead
            TaskController.deleteAll(taskHead.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');
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
            TaskController.update({'members.task._id': task.id}, updatingTask, (err, updatedTasks) => {
                assert.ifError(err);
                TaskController.get(task.id, (err, task) => {
                    (task.description).should.be.equal(updatingTask.description);
                    done();
                });
            });
        });
    });

    // describe('GET task by id', () => {
    //     let task;
    //     const taskHeadInfo = {
    //         title: test_title,
    //         members: test_members,
    //         order: test_order
    //     };
    //     let taskHeadInfo2 = taskHeadInfo;
    //     before(done => {
    //         TaskHead.create(taskHeadInfo, (err, newTaskHead) => {
    //             taskHeadInfo2.title = 'changedTitle!!!';
    //             TaskHead.create(taskHeadInfo2, (err, newTaskHead2) => {
    //                 console.log('newTaskHead=====================');
    //                 console.log(newTaskHead);
    //                 console.log('newTaskHead 2=====================');
    //                 console.log(newTaskHead2);
    //
    //                 TaskHead.createTask(newTaskHead.id, test_task, (err, updatedTaskHead) => {
    //
    //                     task = updatedTaskHead.tasks[0];
    //                     console.log(updatedTaskHead);
    //                     done();
    //                 });
    //             });
    //         });
    //     });
    //     after(done => {
    //         TaskHead.deleteAll(err => {
    //             done();
    //         });
    //     });
    //     it('One task should be find', done => {
    //         // TaskHead.findOne({'tasks._id': task.id}, (err, taskHead) => {
    //         //     console.log('\n===========================');
    //         //     console.log(taskHead);
    //         //     done();
    //         // });
    //         TaskHead.updateTask(task, (err, taskHead) => {
    //             console.log('\n===========================');
    //             console.log(taskHead);
    //             done();
    //         });
    //     });
    // });
});