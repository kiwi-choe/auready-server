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

    let existingTaskHead;
    beforeEach(done => {
        TaskHead.deleteAll(err => {
            // Push test_members to create members
            test_taskhead.members.length = 0;
            test_taskhead.members.push(...test_members);
            existingTaskHead = null;
            TaskHead.create(test_taskhead, (err, newTaskHead) => {
                existingTaskHead = newTaskHead;

                done();
            });
        });
    });

    it('DELETE a taskhead', done => {
        TaskHead.delete(existingTaskHead.id, (err, isRemoved) => {
            assert.ifError(err);
            console.log('\n' + isRemoved);
            done();
        });
    });

    it('Update taskhead - title, add new members', done => {
        const updatingTaskHead = test_taskhead;
        updatingTaskHead.title = 'updatingTaskHead';

        // new member: 'member2'
        // the array does not include the existing members.
        const newMembers = [
            {name: 'member2', email: 'email_member2', tasks: []}
        ];
        updatingTaskHead.members.push(...newMembers);
        console.log('\n-----------------before update ', existingTaskHead);
        TaskHead.update({_id: existingTaskHead.id}, updatingTaskHead, (err, result) => {
            if (err) {
                assert.ifError(err);
            }
            if (!result.n) {
                assert.fail();
            }
            // Find updated taskhead, check taskhead and members
            TaskHead.readById(existingTaskHead.id, (err, updatedTaskHead) => {
                console.log('-----------------after update ');
                console.log(updatedTaskHead);
                assert.equal(updatedTaskHead.title, updatingTaskHead.title);
                assert.equal(updatedTaskHead.members.length, updatingTaskHead.members.length);

                done();
            });
        });
    });
});