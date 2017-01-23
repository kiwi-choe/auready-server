process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');

const Task = require('../../../models/task/task.controller.js');
const TaskHead = require('../../../models/task/taskhead.controller.js');
const test_tasks = [
    {order: 0, description: 'des', detailNote: 'detailnote', completed: false},
    {order: 1, description: 'des1', detailNote: 'detailnote1', completed: false},
    {order: 2, description: 'des2', detailNote: 'detailnote2', completed: false},
    {order: 3, description: 'des3', detailNote: 'detailnote3', completed: false}
];
const test_members = [
    {name: 'member1', email: 'email_member1', tasks: []}
];
const test_taskhead = {
    title: 'titleOfTaskHead',
    order: [
        {member: 'member1', order: 0}
    ],
    members: []
};

const taskObj = {
    order: 555,
    description: 'desNew',
    detailNote: 'detailnoteNew',
    completed: false
};

describe('TaskHead model', () => {

    it('Insert taskhead and the default member', done => {
        // Push test_members to create members
        test_taskhead.members.push(...test_members);
        TaskHead.create(test_taskhead, (err, newTaskHead) => {
            if (newTaskHead) {
                console.log('newTaskHead\n', newTaskHead);
                // assert.notDeepEqual(newTaskHead.members, test_taskhead.members);
                // Read a saved taskHead and a saved member
                TaskHead.readById(newTaskHead.id, (err, taskhead) => {
                    if (err) assert.ifError(err);
                    if (taskhead) {
                        console.log('members\n', taskhead.members);
                        assert.equal(taskhead.members[0].name, test_members[0].name);
                    }
                    done();
                });
            }
        });

    });
});

describe('Task model', () => {
    let accessToken;
    let taskHead;
    before(done => {
        // Create a TaskHead
        TaskHead.create(test_taskhead, (err, newTaskHead) => {
            taskHead = newTaskHead;
            done();
        });
    });
    after(done => {
        // delete all the users
        TaskHead.deleteAll(err => {
            done();
        });
    });

    describe('CREATE a task', () => {
        it('A task is created', done => {
            Task.create(taskHead.id, taskHead.members[0].id, taskObj, (err, newTask) => {
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
            Task.create(taskHead.id, taskHead.members[0].id, taskObj, (err, newTask) => {
                task = newTask;
                done();
            });
        });
        afterEach(done => {
            // Remove All tasks of taskhead
            Task.deleteAll(taskHead.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');
                done();
            });
        });

        it('DELETE a task', done => {
            Task.delete(task.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');
                done();
            });
        });

        it('UPDATE a task', done => {
            let updatingTask = taskObj;
            updatingTask.description = 'changedDescription';
            Task.update({'members.task._id': task.id}, updatingTask, (err, updatedTasks) => {
                assert.ifError(err);
                Task.get(task.id, (err, task) => {
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
    //                 TaskHead.createTask(newTaskHead.id, taskObj, (err, updatedTaskHead) => {
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