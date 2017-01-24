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

const test_task = {
    order: 555,
    description: 'desNew',
    detailNote: 'detailnoteNew',
    completed: false
};

describe('TaskHead model', () => {

    after(done => {
        TaskHead.deleteAll(err => {
            done();
        });
    });

    it('Insert a new taskhead and new members', done => {
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
                        console.log('saved taskHead\n', taskhead);
                        assert.equal(taskhead.members[0].name, test_members[0].name);
                    }
                    done();
                });
            }
        });
    });
});

describe('There is a taskhead in DB for UPDATE, DELETE test', () => {

    let taskHead;
    beforeEach(done => {
        TaskHead.create(test_taskhead, (err, newTaskHead) => {
            taskHead = newTaskHead;
            done();
        });
    });
    afterEach(done => {
        TaskHead.deleteAll(err => {
            done();
        });
    });

    it('DELETE a taskhead', done => {
        TaskHead.delete(taskHead.id, (err, isRemoved) => {
            assert.ifError(err);
            console.log('\n' + isRemoved);
            done();
        });
    });

    it('Update taskhead - title', done => {
        const updatingTaskHead = test_taskhead;
        updatingTaskHead.title = 'updatingTaskHead';
        // updatingTaskHead.members = [
        //     {name: 'member1', email: 'email_member1', tasks: test_tasks},
        //     {name: 'member2', email: 'email_member2', tasks: test_tasks}
        // ];
        TaskHead.update({_id: taskHead.id}, updatingTaskHead, (err, result) => {
            if (err) {
                assert.ifError(err);
            }
            if (!result.n) {
                assert.fail();
            }
            // Find updated taskhead
            TaskHead.readById(taskHead.id, (err, updatedTaskHead) => {
                console.log('\n' + updatedTaskHead);
                assert.equal(updatedTaskHead.title, updatingTaskHead.title);
                done();
            });
        });
    });
});