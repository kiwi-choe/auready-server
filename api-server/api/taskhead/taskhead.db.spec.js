process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
require('../../../www');

const Task = require('../../../models/task/task.controller');
const TaskHead = require('../../../models/task/taskhead.controller');
const TaskHeadModel = require('../../../models/task/taskhead');

const test_members = [
    {id: 'stubbed_memberId0', userId: 'userId0', name: 'member0', email: 'email_member0', tasks: []},
    {id: 'stubbed_memberId1', userId: 'userId1', name: 'member1', email: 'email_member1', tasks: []},
];

const test_taskhead = {
    id: 'stubbed_taskheadId',
    title: 'titleOfTaskHead',
    color: 222,
    members: []
};

describe('TaskHeadDBController model', () => {

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

    const existingMembers = [
        {id: 'stubbed_memberId0', userId: 'userId0', name: 'member0', email: 'email_member1', tasks: []}
    ];
    beforeEach(done => {
        TaskHead.deleteAll(err => {
            // Push test_members to create members
            test_taskhead.members.length = 0;
            test_taskhead.members.push(...existingMembers);
            existingTaskHead = null;
            TaskHead.create(test_taskhead, (err, newTaskHead) => {
                existingTaskHead = newTaskHead;

                done();
            });
        });
    });

    it('DELETE a taskhead', done => {
        TaskHead.deleteOne(existingTaskHead.id, (err, isRemoved) => {
            assert.ifError(err);
            console.log('\n' + isRemoved);
            done();
        });
    });

    it('Update taskhead - title', done => {
        const updatingTaskHead = test_taskhead;
        updatingTaskHead.title = 'updatingTaskHead';

        console.log('\n-----------------before update ', existingTaskHead);
        TaskHeadModel.update({id: existingTaskHead.id},
            updatingTaskHead, (err, result) => {
                if (err) {
                    assert.ifError(err);
                }
                if (!result.n) {
                    assert.fail();
                }
                // Find updated taskhead, check taskhead
                TaskHead.readById(existingTaskHead.id, (err, updatedTaskHead) => {
                    console.log('-----------------after update ');
                    console.log(updatedTaskHead);
                    assert.equal(updatedTaskHead.title, updatingTaskHead.title);

                    done();
                });
            });
    });

    it('Update taskhead - add new members', done => {
        // new member: 'member2'
        // the array does not include the existing members.
        const newMembers = test_members;
        console.log('\n-----------------before update ', existingTaskHead);

        // Duplication check
        newMembers.forEach((newMember, i) => {
            // There is no member with newMember.id
            TaskHeadModel.find({
                id: existingTaskHead.id,
                'members.id': newMember.id
            }, (err, found) => {
                if (found.length !== 0) {
                    if (i === newMembers.length - 1) {
                        done();
                    }
                    return;
                }
                // push new member and update
                TaskHeadModel.update(
                    {id: existingTaskHead.id},
                    {$push: {members: newMember}},
                    (err, result) => {
                        if (err) {
                            assert.ifError(err);
                        }
                        if (!result.n) {
                            assert.fail();
                        }
                        // Find updated taskhead, check members
                        TaskHead.readById(existingTaskHead.id, (err, updatedTaskHead) => {
                            console.log('-----------------after update ');
                            console.log(updatedTaskHead);

                            if (i === newMembers.length - 1) {
                                assert.equal(updatedTaskHead.members.length, 2);
                                done();
                            }
                        });
                    });
            });
        });
    });

    it('Update all - update details ( title, members )', done => {

        // new member: 'member2', 'member3'
        // WARN! but this array includes the existing member.
        const paramMembers = [
            {id: 'stubbed_memberId0', userId: 'userId0', name: 'member0', email: 'email_member0', tasks: []},
            {id: 'stubbed_memberId2', userId: 'userId2', name: 'member2', email: 'email_member2', tasks: []},
            {id: 'stubbed_memberId3', userId: 'userId3', name: 'member3', email: 'email_member3', tasks: []}
        ];
        let updatingTaskHead = {
            id: 'stubbed_taskheadId',
            title: 'updatingTaskHead',
            color: 555,
            members: paramMembers
        };
        console.log('\n-----------------before update ', existingTaskHead);

        // Duplication check to add new members
        let newMembers = [];
        paramMembers.forEach((member, i) => {
            TaskHead.readById(existingTaskHead.id, (err, taskhead) => {
                if (!taskhead) {
                    console.log('taskhead id is wrong');
                    if (i === paramMembers.length - 1) {
                        done();
                    }
                    return;
                }

                // There is no member with newMember.name
                TaskHeadModel.find({'members.id': member.id}, (err, found) => {
                    if (found.length === 0) {
                        // push new member
                        newMembers.push(member);
                    }

                    // when end of paramMembers,
                    if (i === paramMembers.length - 1) {

                        // console.log('----------------- newMembers \n', newMembers);
                        if (newMembers.length === 0) {
                            done();
                        }
                        // Update
                        TaskHeadModel.update(
                            {id: existingTaskHead.id},     // query
                            {
                                $push: {members: {$each: newMembers}},    // options
                                $set: {title: updatingTaskHead.title, color: updatingTaskHead.color}
                            }, (err, result) => {
                                if (err) {
                                    assert.ifError(err);
                                }
                                if (!result.n) {
                                    assert.fail();
                                }
                                // Find updated taskhead, check taskhead
                                TaskHead.readById(existingTaskHead.id, (err, updatedTaskHead) => {
                                    console.log('-----------------after update ');
                                    console.log(updatedTaskHead);
                                    assert.equal(updatedTaskHead.title, updatingTaskHead.title);
                                    assert.equal(updatedTaskHead.color, updatingTaskHead.color);
                                    assert.equal(updatedTaskHead.members.length, 3);
                                    updatedTaskHead.members.forEach((member, i) => {
                                        if (member.name === existingTaskHead.members[0].name) {
                                            assert.deepEqual(member.id, existingTaskHead.members[0].id);
                                        }

                                        if (i === updatedTaskHead.members.length - 1) {
                                            done();
                                        }
                                    });
                                });
                            });
                    }
                });
            });
        });
    });

    it('Update taskheadDetail - members 0', done => {
        // no adding members
        let updatingTaskHead = {
            id: 'stubbed_taskheadId',
            title: 'updatingTaskHead',
            color: 555,
            members: []
        };
        console.log('\n-----------------before update ', existingTaskHead);

        let newMembers = [];
        // 1. Check if this taskHead is exist
        TaskHead.readById(updatingTaskHead.id, (err, taskhead) => {
            if (!taskhead) {
                assert.fail(taskhead, existingTaskHead, "taskhead id is wrong");
                done();
            }

            // 2. Push new members to update
            const addingMembers = updatingTaskHead.members;
            // if No members
            if(addingMembers.length === 0) {

                // Update
                TaskHeadModel.update(
                    {id: existingTaskHead.id},     // query
                    {
                        $set: {title: updatingTaskHead.title, color: updatingTaskHead.color}
                    }, (err, result) => {
                        if (err) {
                            assert.ifError(err);
                        }
                        if (!result.n) {
                            assert.fail();
                        }
                        // Find updated taskhead, check taskhead
                        TaskHead.readById(existingTaskHead.id, (err, updatedTaskHead) => {
                            console.log('-----------------after update ');
                            console.log(updatedTaskHead);
                            assert.equal(updatedTaskHead.title, updatingTaskHead.title);
                            assert.equal(updatedTaskHead.color, updatingTaskHead.color);
                            done();
                        });
                    });
            }

            // if there are adding members
            // push new members rotating for loop
        });
    });
});

describe('Update a taskhead - delete a member', () => {

    let existingTaskHead;
    const existingMembers = [
        {id: 'stubbed_memberId1', name: 'member1', email: 'email_member1', tasks: []},
        {id: 'stubbed_memberId2', name: 'member2', email: 'email_member2', tasks: []}
    ];
    beforeEach(done => {
        TaskHead.deleteAll(err => {
            // Push test_members to create members
            test_taskhead.members.length = 0;
            test_taskhead.members.push(...existingMembers);
            existingTaskHead = null;
            TaskHead.create(test_taskhead, (err, newTaskHead) => {
                existingTaskHead = newTaskHead;
                done();
            });
        });
    });

    it('member id of the index 0', done => {

        let deletingMemberId = existingTaskHead.members[1].id;
        console.log('deletingMemberId - ', deletingMemberId);

        function findMembers(member) {
            return (member.id === deletingMemberId);
        }

        // find a taskhead including this member's id
        TaskHeadModel.findOne({'members.id': deletingMemberId}, (err, taskhead) => {
            if (!taskhead) {
                assert.fail('fail to find the taskhead');
                done();
            }
            console.log(taskhead);

            // delete the member from member array
            let deletingIndex = taskhead.members.findIndex(findMembers);
            let deletedMember = taskhead.members.splice(deletingIndex, 1);
            console.log('\ndeletedMember - ', deletedMember);

            taskhead.save((err, updatedTaskHead) => {
                assert.equal(updatedTaskHead.id, existingTaskHead.id);
                assert.equal(updatedTaskHead.members.length, 1);
                assert.equal(updatedTaskHead.members[0].name, existingTaskHead.members[0].name);

                console.log('\nupdatedTaskHead - ', updatedTaskHead);
                done();

            });
        });
    });
});

describe('There are taskheads in DB', () => {

    const members = test_members;
    const taskHeads = [
        {title: 'titleOfTaskHead0', members: members},
        {title: 'titleOfTaskHead1', members: members},
        {title: 'titleOfTaskHead2', members: members}
    ];

    let savedTaskHeads = [];
    beforeEach(done => {
        savedTaskHeads.length = 0;
        TaskHead.deleteAll(err => {

            // Create 3 taskHeads
            taskHeads.forEach((taskHead, i) => {
                TaskHead.create(taskHead, (err, newTaskHead) => {
                    savedTaskHeads.push(newTaskHead);

                    if (taskHeads.length - 1 === i) {
                        done();
                    }
                });
            });
        });
    });

    it('Delete taskheads', done => {
        let deletingTaskHeadIds = [];
        for (let i = 0; i < savedTaskHeads.length; i++) {
            deletingTaskHeadIds.push(savedTaskHeads[i].id);
        }
        console.log(deletingTaskHeadIds);
        // delete multi
        TaskHeadModel.remove({id: {$in: deletingTaskHeadIds}}, (err, removed) => {
            assert.equal(removed.result.n, 3);
            if (removed.result.n !== 0) {
                // Find to check if removed successfully
                TaskHeadModel.find({id: {$in: deletingTaskHeadIds}}, (err, taskheads) => {
                    if (taskheads.length !== 0) {
                        assert.fail('remove fail');
                    } else {
                        assert.ok('cannot find this ids');
                    }
                    done();
                });
            }
        });

    });

});

describe('Get taskheads', () => {

    const membersA = [
        {id: 'member0_id', userId: 'member0_userId', name: 'member0', email: 'email_member0', tasks: []},
        {id: 'member1_id', userId: 'member1_userId', name: 'member1', email: 'email_member1', tasks: []},
    ];
    const membersB = [
        {id: 'member0_id', userId: 'member0_userId', name: 'member1', email: 'email_member1', tasks: []},
        {id: 'member1_id', userId: 'member1_userId', name: 'member2', email: 'email_member2', tasks: []},
    ];

    const taskHeads = [
        {title: 'titleOfTaskHead0', members: membersA},
        {title: 'titleOfTaskHead1', members: membersB},
        {title: 'titleOfTaskHead2', members: membersB}
    ];

    let savedTaskHeads = [];
    beforeEach(done => {
        savedTaskHeads.length = 0;
        TaskHead.deleteAll(err => {

            // Create 3 taskHeads
            taskHeads.forEach((taskHead, i) => {
                TaskHead.create(taskHead, (err, newTaskHead) => {
                    savedTaskHeads.push(newTaskHead);

                    if (taskHeads.length - 1 === i) {
                        done();
                    }
                });
            });
        });
    });

    it('Get taskHeads of \'member2\'', done => {
        TaskHeadModel.find({'members.userId': membersB[1].userId}, (err, taskheads) => {
            if (err) {
                assert.fail('err');
            }
            // cannot return just the selected subDocuments, You'll get all of them.
            // So, You can filter on the client side.
            for (let i = 0; i < taskheads.length; i++) {
                console.log('\n' + i + '- ' + taskheads[i]);
            }
            done();
        });
    });

    it('Invoke an exception when there is no member trying to find', done => {
        TaskHeadModel.find({'members.userId': 'no member'}, (err, taskheads) => {
            if (err) {
                assert.fail('err');
            }
            if (taskheads.length === 0) {
                assert.ok('no member');
            } else {
                assert.fail('found taskheads - ', taskheads);
            }
            done();
        });
    });
});