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

    describe('Delete tasks within a member - Update a taskhead', () => {

        beforeEach(done => {
            // Remove All tasks of taskhead
            Task.deleteAll(savedTaskHead.id, (err, isRemoved) => {
                assert.ifError(err);
                isRemoved.should.be.true('isRemoved should be true');
                done();
            });
        });

        it('cannot find a taskhead doc, with wrong task\'s id', done => {
            let deletingTaskIds = [];
            deletingTaskIds.push('wrong id');

            // find tasks including this task ids
            TaskHeadModel.findOne({'members.tasks.id': {$in: deletingTaskIds}}, (err, taskhead) => {
                if (!taskhead) {
                    console.log('\ncannot find a taskhead doc with wrong id');
                } else {
                    assert.fail('fail this test');
                }

                done();
            });

        });

        it('delete a task test', done => {
            let id = test_tasks[0].id;
            console.log('deleting id - ', id);
            TaskHeadModel.findOne({'members.tasks.id': id}, (err, taskhead) => {
                for (let member of taskhead.members) {
                    for (let i in member.tasks) {
                        if (member.tasks[i].id === id) {
                            // Remove a task of this taskhead
                            console.log('\nmember.tasks[i] - ', member.tasks[i]);
                            member.tasks.splice(i, 1);

                            taskhead.save((err, updated) => {
                                console.log('updated - ', updated.members[0].tasks);
                                assert.equal(updated.members[0].tasks.length, 2);
                                done();
                            });
                        }
                    }

                }
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
                id: test_tasks[1].id,
                description: 'desUPDATE!!!!!',
                completed: true
            };

            TaskHeadModel.findOne({'members.tasks.id': taskObj.id}, (err, taskhead) => {
                if (err) {
                    assert.fail('called with wrong id');
                    done();
                }
                if (!taskhead) {
                    assert.fail('called with wrong id');
                    done();
                }
                for(let member of taskhead.members) {
                    for(let i in member.tasks) {
                        if (member.tasks[i].id === taskObj.id) {
                            // Update a task of this taskhead
                            console.log('\nmember.tasks[i] - ', member.tasks[i]);
                            member.tasks[i].description = taskObj.description;
                            member.tasks[i].completed = taskObj.completed;

                            taskhead.save((err, updated) => {
                                console.log('updated - ', updated.members[0].tasks);
                                console.log('updated - ', updated.members[1].tasks);
                                assert.equal(updated.members[0].tasks[i].id, taskObj.id);
                                assert.equal(updated.members[0].tasks[i].description, taskObj.description);
                                done();
                            });
                        }
                    }
                }
            });
        });

        it('updating tasks with memberid', done => {
            const memberId = test_members[0].id;
            // const memberId1 = test_members[1].id;
            const updatingTasks = [
                {id: test_tasks[0].id, description: 'updating DES0', completed: false, order: 0},
                {id: test_tasks[1].id, description: 'updating DES1', completed: false, order: 0},
                {id: test_tasks1[0].id, description: 'updating DES3', completed: false, order: 0},
                {id: test_tasks1[1].id, description: 'updating DES4', completed: false, order: 0},
            ];
            TaskHeadModel.findOne({'members.id': memberId}, (err, taskhead) => {

                let updatingMemberIndex = taskhead.members.findIndex(member => {
                    return member.id === memberId;
                });
                const taskArr = taskhead.members[updatingMemberIndex].tasks;
                // Init
                taskArr.length = 0;
                Array.prototype.push.apply(taskArr, updatingTasks);

                taskhead.save((err, updated) => {
                    if(err) {
                        assert.ifError(err);
                        done();
                    }
                    if(!updated) {
                        assert.fail();
                        done();
                    }
                    assert.equal(updated.members[0].tasks[0].description, updatingTasks[0].description);
                    console.log(updated.members[0].tasks);
                    done();
                });
            });
        });

        it('updating tasks with taskHeadId, find members and tasks without mongodb query', done => {
            const taskHeadId = savedTaskHead.id;
            const updatingTasks = [
                {id: test_tasks[0].id, description: 'updating DES0', completed: false, order: 0},
                {id: test_tasks[1].id, description: 'updating DES1', completed: false, order: 0}];
            const updatingTasks1 = [
                {id: test_tasks1[0].id, description: 'updating DES3', completed: false, order: 0},
                {id: test_tasks1[1].id, description: 'updating DES4', completed: false, order: 0}];
            const memberTasks = [
                {memberid: test_members[0].id, tasks: updatingTasks},
                {memberid: test_members[1].id, tasks: updatingTasks1}];

            TaskHeadModel.findOne({id: taskHeadId}, (err, taskhead) => {
                memberTasks.forEach((memberTask, i) => {
                    let updatingMemberIndex = taskhead.members.findIndex(member => {
                        return member.id === memberTask.memberid;
                    });
                    const taskArr = taskhead.members[updatingMemberIndex].tasks;
                    taskArr.length = 0;
                    taskArr.push(...memberTask.tasks);

                    if (i === memberTasks.length - 1) {
                        taskhead.save((err, updated) => {
                            console.log('updated.members[0] - ', updated.members[0]);
                            console.log('updated.members[1] - ', updated.members[1]);

                            done();
                        });
                    }
                });
            });
        });

        it('read tasks by memberid', done => {
            const memberId = test_members[0].id;
            TaskHeadModel.findOne({'members.id': memberId}, (err, taskHead) => {
                if(err) done(err);
                if(!taskHead) {
                    console.log('no taskhead');
                    done();
                }
                let foundMemberIndex = taskHead.members.findIndex(member => {
                    return member.id === memberId;
                });
                const taskArr = taskHead.members[foundMemberIndex].tasks;
                console.log(taskArr);
                done();
            });
        });
    });
});