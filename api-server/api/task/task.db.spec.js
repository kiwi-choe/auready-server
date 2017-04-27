process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
require('../../../www');

const Task = require('../../../models/task/task.controller');
const TaskHead = require('../../../models/task/taskhead.controller');
const TaskHeadModel = require('../../../models/task/taskhead');

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
    {id: 'stubbedMemberId1', name: 'member1', email: 'email_member1', tasks: test_tasks1}
];
const test_taskhead = {
    id: 'stubbedTaskHeadId',
    title: 'titleOfTaskHead',
    members: test_members
};


describe('There is a taskhead in DB ', () => {
    let savedTaskHead;
    before(done => {

        // Create a TaskHeadDBController
        TaskHead.create(test_taskhead, (err, newTaskHead) => {
            savedTaskHead = newTaskHead;
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
            TaskHeadModel.findOne({'members.tasks.id': {$in: deletingTaskIds}}, (err, taskhead) => {
                if (!taskhead) {
                    assert.ok('cannot find a taskhead doc with wrong id');
                } else {
                    assert.fail('fail this test');
                }

                done();
            });

        });
    });

    describe('Update a taskhead - update a task', () => {

        it('with wrong task id', done => {
            TaskHeadModel.findOne({'members.tasks.id': 'wrongid'}, (err, taskhead) => {
                if (err) {
                    assert.ifError(err);
                } else {
                    assert.ok('should be called with wrong id');
                }
                done();
            });
        });

        it('updating task index is 1', done => {
            const taskObj = {
                description: 'desUPDATE!!!!!',
                completed: true
            };

            const updatingTask = test_tasks[1];
            TaskHeadModel.findOne({'members.tasks.id': updatingTask.id}, (err, taskhead) => {
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
                    return task.id === updatingTask.id;
                });

                assert.equal(updatingTaskIndex, 1, 'savedTaskHead index same to updatingTaskIndex');

                // Overwrite data
                taskArr[updatingTaskIndex].description = taskObj.description;
                taskArr[updatingTaskIndex].completed = taskObj.completed;
                console.log('\ntaskArr - ', taskArr);
                // Update taskhead
                taskhead.save((err, updatedTaskHead) => {
                    if (err) {
                        assert.fail('fail to update');
                    }

                    if (!updatedTaskHead) {
                        assert.fail('fail to update');
                        done();
                    }
                    console.log('\n\n--------after \n updatedTaskHead.member[0] - ', updatedTaskHead.members[0]);
                    done();
                });
            });
        });

        it('updating tasks with memberid', done => {
            const memberId0 = test_members[0].id;
            const memberId1 = test_members[1].id;
            const updatingTasks = [
                {id: 'stubbedTaskId0', description: 'updating DES0', completed: false, order: 0},
                {id: 'stubbedTaskId1', description: 'updating DES1', completed: false, order: 0},
                {id: 'stubbedTaskId3', description: 'updating DES3', completed: false, order: 0},
                {id: 'stubbedTaskId4', description: 'updating DES4', completed: false, order: 0},
            ];
            TaskHeadModel.findOne({'members.id': savedTaskHead.members[1].id}, (err, taskhead) => {

                let updatingMemberIndex = taskhead.members.findIndex((member) => {
                    return member.id === memberId1;
                });
                const taskArr = taskhead.members[updatingMemberIndex].tasks;
                console.log('this member id - ', taskhead.members[updatingMemberIndex].id);
                console.log('taskArr - ', taskArr);
                const len = updatingTasks.length;
                for (let i = 0; i < len; i++) {
                    // extract the updating task from tasks array
                    // const tmpTaskArr = taskhead.members[0].tasks;
                    let updatingTaskIndex = taskArr.findIndex((task) => {
                        return task.id === updatingTasks[i].id;
                    });
                    taskArr[updatingTaskIndex] = updatingTasks[i];

                    if (i === len - 1) {
                        taskhead.save((err, updatedTaskHead) => {
                            if (!updatedTaskHead) {
                                assert.fail('no updatedTaskHead');
                                done();
                            }
                            // Check the new tasks are saved
                            const updatedTasks = updatedTaskHead.members[updatingMemberIndex].tasks;
                            if (updatedTasks) {
                                console.log('\nupdatedTasks - ', updatedTasks);
                                assert.ok('updating success');
                                done();
                            } else {

                                // fail to update
                                done();
                            }
                        });
                    }
                }
            });
        });

    });
});