process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
require('../../../www');

const Task = require('../../../models/task/task.controller');
const TaskHead = require('../../../models/task/taskhead.controller');
const TaskHeadModel = require('../../../models/task/taskhead');

const test_members = [
    {name: 'member1', email: 'email_member1', tasks: []}
];
const test_taskhead = {
    title: 'titleOfTaskHead',
    order: [
        {member: 'member1', order: 0}
    ],
    members: test_members
};

const test_tasks = [
    {order: 0, description: 'des', detailNote: 'detailnote', completed: false},
    {order: 1, description: 'des1', detailNote: 'detailnote1', completed: false},
    {order: 2, description: 'des2', detailNote: 'detailnote2', completed: false},
];

describe('There is a taskhead in DB ', () => {
    let savedTaskHead;
    before(done => {
        // delete all the users
        TaskHead.deleteAll(err => {

            // Create a TaskHeadDBController
            TaskHead.create(test_taskhead, (err, newTaskHead) => {
                savedTaskHead = newTaskHead;
                done();
            });
        });
    });

    describe('CREATE a task', () => {
        it('A task is created', done => {
            let test_task = test_tasks[0];
            Task.create(savedTaskHead.members[0].id, test_task, (err, newTask) => {
                assert.ifError(err);
                if (newTask) {
                    console.log(newTask);
                    // const lenOfTasks = taskHeadOfNewTask.members[0].tasks.length;
                    // console.log('\n' + taskHeadOfNewTask.members[0].tasks[lenOfTasks-1].description);
                    assert.equal(newTask.description, test_task.description, 'not equal description');
                } else {
                    assert.fail('fail to create a task');
                }
                done();
            });
        });
    });

    describe('Update a taskhead - delete tasks within a member ', () => {

        let savedTasks = [];
        beforeEach(done => {
            // Remove All tasks of taskhead
            savedTasks.length = 0;
            Task.deleteAll(savedTaskHead.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');

                // Create 3 tasks
                test_tasks.forEach((task, i) => {
                    Task.create(savedTaskHead.members[0].id, task, (err, newTask) => {
                        savedTasks.push(newTask);

                        if (test_tasks.length - 1 === i) {
                            assert.equal(savedTasks.length, 3);
                            done();
                        }
                    });
                });

            });
        });

        it('cannot find a taskhead doc, with wrong task\'s id', done => {
            let deletingTaskIds = [];
            deletingTaskIds.push('wrong id');

            // find tasks including this task ids
            TaskHeadModel.findOne({'members.tasks._id': {$in: deletingTaskIds}}, (err, taskhead) => {
                if (!taskhead) {
                    assert.ok('cannot find a taskhead doc with wrong id');
                } else {
                    assert.fail('fail this test');
                }

                done();
            });

        });

        it('task indexes are 0, 2', done => {
            let deletingTaskIds = [];
            deletingTaskIds.push(savedTasks[0].id);
            deletingTaskIds.push(savedTasks[2].id);

            // find tasks including this task ids
            TaskHeadModel.findOne({'members.tasks._id': {$in: deletingTaskIds}}, (err, taskhead) => {
                if (err) {
                    assert.fail(err);
                }
                if (!taskhead) {
                    assert.fail('cannot find a taskhead doc');
                    done();
                }
                // found taskhead's member is only one coz task's id is unique - taskhead.member.length: 1
                // delete tasks from task array
                const taskArr = taskhead.members[0].tasks;
                deletingTaskIds.forEach((deletingTaskId, i) => {
                    let deletingIndex = taskArr.findIndex((task) => {
                        return task._id.equals(deletingTaskId);
                    });
                    let deletedTask = taskArr.splice(deletingIndex, 1);
                    console.log('\ndeletedTask - ', deletedTask);

                    if(deletingTaskIds.length-1 === i) {
                        // Update taskhead
                        taskhead.save((err, updatedTaskHead) => {
                            assert.equal(updatedTaskHead.members[0].tasks.length, 1);
                            console.log('\nupdatedTaskHead.member[0].tasks - ', updatedTaskHead.members[0].tasks);
                            done();
                        });
                    }
                });
            });

        });
    });

});


// describe('EDIT tasks', () => {
//     let task;
//     beforeEach(done => {
//         Task.create(taskHead.id, taskHead.members[0].id, test_task, (err, newTask) => {
//             task = newTask;
//             done();
//         });
//     });
//     afterEach(done => {
//         // Remove All tasks of taskhead
//         Task.deleteAll(taskHead.id, (err, isRemoved) => {
//             assert.ifError(err);
//             isRemoved.should.be.true('isRemoved should be true');
//             done();
//         });
//     });
//
//     it('DELETE a task', done => {
//         Task.delete(task.id, (err, isRemoved) => {
//             assert.ifError(err);
//             isRemoved.should.be.true('isRemoved should be true');
//             done();
//         });
//     });
//
//     it('UPDATE a task', done => {
//         let updatingTask = test_task;
//         updatingTask.description = 'changedDescription';
//         Task.update({'members.task._id': task.id}, updatingTask, (err, updatedTasks) => {
//             assert.ifError(err);
//             Task.get(task.id, (err, task) => {
//                 (task.description).should.be.equal(updatingTask.description);
//                 done();
//             });
//         });
//     });
// });

// describe('GET task by id', () => {
//     let task;
//     const taskHeadInfo = {
//         title: test_title,
//         members: test_members,
//         order: test_order
//     };
//     let taskHeadInfo2 = taskHeadInfo;
//     before(done => {
//         TaskHeadDBController.create(taskHeadInfo, (err, newTaskHead) => {
//             taskHeadInfo2.title = 'changedTitle!!!';
//             TaskHeadDBController.create(taskHeadInfo2, (err, newTaskHead2) => {
//                 console.log('newTaskHead=====================');
//                 console.log(newTaskHead);
//                 console.log('newTaskHead 2=====================');
//                 console.log(newTaskHead2);
//
//                 TaskHeadDBController.createTask(newTaskHead.id, test_task, (err, updatedTaskHead) => {
//
//                     task = updatedTaskHead.tasks[0];
//                     console.log(updatedTaskHead);
//                     done();
//                 });
//             });
//         });
//     });
//     after(done => {
//         TaskHeadDBController.deleteAll(err => {
//             done();
//         });
//     });
//     it('One task should be find', done => {
//         // TaskHeadDBController.findOne({'tasks._id': task.id}, (err, taskHead) => {
//         //     console.log('\n===========================');
//         //     console.log(taskHead);
//         //     done();
//         // });
//         TaskHeadDBController.updateTask(task, (err, taskHead) => {
//             console.log('\n===========================');
//             console.log(taskHead);
//             done();
//         });
//     });
// });