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
    members: test_members
};

const test_tasks = [
    {id: 'stubbedTaskId0', description: 'des', completed: false, order: 0},
    {id: 'stubbedTaskId1', description: 'des1', completed: false, order: 0},
    {id: 'stubbedTaskId2', description: 'des2', completed: false, order: 0}
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

                    if (deletingTaskIds.length - 1 === i) {
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

    describe('Update a taskhead - update a task', () => {

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

        it('with wrong task id', done => {

            TaskHeadModel.findOne({'members.tasks._id': 'wrongid'}, (err, taskhead) => {
                if (err) {
                    assert.ok(err, 'should be called with wrong id');
                } else {
                    assert.fail('fail');
                }
                done();
            });
        });

        it('updating task index is 1', done => {
            const taskObj = {
                description: 'desUPDATE!!!!!',
                completed: true
            };

            const updatingTask = savedTasks[1];
            TaskHeadModel.findOne({'members.tasks._id': updatingTask.id}, (err, taskhead) => {
                if (err) {
                    assert.fail('called with wrong id');
                    done();
                }
                if (!taskhead) {
                    assert.fail('called with wrong id');
                    done();
                }

                console.log('\n\n--------before \n taskhead.members[0].tasks - ', taskhead.members[0].tasks);
                // extract the updating task from tasks array
                const taskArr = taskhead.members[0].tasks;
                let updatingTaskIndex = taskArr.findIndex((task) => {
                    return task._id.equals(updatingTask.id);
                });

                assert.equal(updatingTaskIndex, 1, 'savedTaskHead index same to updatingTaskIndex');

                // Overwrite data
                taskArr[updatingTaskIndex].description = taskObj.description;
                taskArr[updatingTaskIndex].completed = taskObj.completed;
                console.log('\ntaskArr - ', taskArr);
                // Update taskhead
                taskhead.save((err, updatedTaskHead) => {
                    if(err) {
                        assert.fail('fail to update');
                    }

                    if(!updatedTaskHead) {
                        assert.fail('fail to update');
                        done();
                    }
                    console.log('\n\n--------after \n updatedTaskHead.member[0] - ', updatedTaskHead.members[0]);
                    done();
                });
            });
        });
    });
});