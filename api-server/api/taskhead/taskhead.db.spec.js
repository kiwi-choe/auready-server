process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');

const Task = require('../../../models/task/task.controller');
const TaskHead = require('../../../models/task/taskhead.controller');
const TaskHeadModel = require('../../../models/task/taskhead');

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

    it('Update taskhead - title', done => {
        const updatingTaskHead = test_taskhead;
        updatingTaskHead.title = 'updatingTaskHead';

        console.log('\n-----------------before update ', existingTaskHead);
        TaskHead.update({_id: existingTaskHead.id},
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
        const newMembers = [
            {name: 'member1', email: 'email_member1', tasks: []},
            {name: 'member2', email: 'email_member2', tasks: []}
        ];
        console.log('\n-----------------before update ', existingTaskHead);

        // Duplication check
        newMembers.forEach((newMember, i) => {
            // There is no member with newMember.name
            TaskHeadModel.find({
                _id: existingTaskHead.id,
                'members.name': newMember.name
            }, (err, found) => {
                console.log('newMember- ', newMember);
                if (found.length !== 0) {
                    return;
                }
                // push new member and update
                TaskHead.update(
                    {_id: existingTaskHead.id},
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
        let updatingTaskHead = test_taskhead;
        updatingTaskHead.title = 'updatingTaskHead';
        // new member: 'member2', 'member3'
        // WARN! but this array includes the existing member.
        const paramMembers = [
            {name: 'member1', email: 'email_member1', tasks: []},
            {name: 'member2', email: 'email_member2', tasks: []},
            {name: 'member3', email: 'email_member3', tasks: []}
        ];
        console.log('\n-----------------before update ', existingTaskHead);

        // Duplication check to add new members
        let newMembers = [];
        paramMembers.forEach((member, i) => {
            // There is no member with newMember.name
            TaskHeadModel.find({
                _id: existingTaskHead.id,
                'members.name': member.name
            }, (err, found) => {
                if (found.length !== 0) {
                    return;
                }
                // push new member
                console.log('newMember- ', member);
                newMembers.push(member);

                // when end of paramMembers,
                if (i === paramMembers.length - 1) {

                    console.log('----------------- newMembers \n', newMembers);

                    // Update
                    TaskHeadModel.update(
                        {_id: existingTaskHead.id},     // query
                        {
                            $push: {members: {$each: newMembers}},    // options
                            $set: {title: updatingTaskHead.title}
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
                                assert.equal(updatedTaskHead.members.length, 3);
                                updatedTaskHead.members.forEach((member, i) => {
                                    if (member.name === existingTaskHead.members[0].name) {
                                        assert.deepEqual(member._id, existingTaskHead.members[0]._id);
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

    it('Update details with 1 existing member, 1 new member', done => {
        // new member: 'member2'
        // WARN! but this array includes the existing member only.
        const paramMembers = [
            {name: 'member1', email: 'email_member1', tasks: []},
            {name: 'member2', email: 'email_member2', tasks: []}
        ];
        console.log('\n-----------------before update ', existingTaskHead);

        // Duplication check to add new members
        let newMembers = [];
        // for(let i=0, member; member=paramMembers[i]; i++) {
        //     console.log('member ', member);
        //     console.log('i ', i);
        //
        //     // There is no member with newMember.name
        //     TaskHeadModel.find({
        //         // _id: existingTaskHead.id,
        //         _id: 'wrongid',
        //         'members.name': member.name
        //     }, (err, found) => {
        //         if (!found) {
        //             console.log('taskhead id is wrong');
        //             done();
        //             return;
        //         }
        //
        //         console.log('\nfound.length ', found.length);
        //         if (found.length === 0) {
        //             // push new member
        //             console.log('\nnewMember- ', member);
        //             newMembers.push(member);
        //         } else {
        //             console.log('paramMembers.length ', paramMembers.length);
        //         }
        //
        //         if (i === paramMembers.length - 1) {
        //
        //             console.log('newMembers ', newMembers);
        //             console.log('newMembers.length ', newMembers.length);
        //             if (newMembers.length === 0) {
        //                 done();
        //             } else {
        //                 // Update
        //                 done();
        //             }
        //         }
        //     });
        // }

        paramMembers.forEach((member, i) => {
            console.log('member ', member);
            console.log('i ', i);

            // There is no member with newMember.name
            TaskHeadModel.find({
                // _id: existingTaskHead.id,
                _id: 'wrongid',
                'members.name': member.name
            }, (err, found) => {
                if(!found) {
                    console.log('taskhead id is wrong');
                    done();
                    return;
                }

                console.log('\nfound.length ', found.length);
                if (found.length === 0) {
                    // push new member
                    console.log('\nnewMember- ', member);
                    newMembers.push(member);
                } else {
                    console.log('paramMembers.length ', paramMembers.length);
                }

                if (i === paramMembers.length - 1) {

                    console.log('newMembers ', newMembers);
                    console.log('newMembers.length ', newMembers.length);
                    if (newMembers.length === 0) {
                        done();
                    } else {
                        // Update
                        done();
                    }
                }
            });


        });

    });
});