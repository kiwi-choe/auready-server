process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const server = require('../../../www');
const request = require('supertest')(server);

const Token = require('../../../models/token.controller');
const predefine = require('../../../predefine');
const clientId = predefine.trustedClientInfo.clientId;

const User = require('../../../models/user.controller');
const name = 'nameofkiwi3';
const email = 'kiwi3@gmail.com';
const password = '123';

const TaskHeadDBController = require('../../../models/task/taskhead.controller.js');
let currentUserId;
const test_members = [{
    id: 'id_member1',
    userId: currentUserId,
    name: 'member1',
    email: 'email_member1',
    tasks: []
}];
const test_taskhead = {
    id: 'stubIdOfTaskHead',
    title: 'titleOfTaskHead',
    color: 222,  // default color
    orders: [{
        userId: currentUserId,
        orderNum: 0
    }],
    members: test_members
};

describe('TaskHeadDBController - need the accessToken to access API resources ', () => {

    let accessToken;
    beforeEach(done => {
        // Register user first
        User.create(name, email, password, true, (err, user, info) => {
            currentUserId = user.id;
            // Add Token
            Token.create(clientId, user.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;
                done();
            });
        });
    });
    afterEach(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });
    describe('Create a taskHead', () => {

        it('POST /taskheads', done => {
            request
                .post('/taskheads')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({
                    id: test_taskhead.id,
                    title: test_taskhead.title,
                    color: test_taskhead.color,
                    members: test_members
                })
                .expect(201)
                .end(err => {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('Update, Delete a taskhead', () => {

        let taskHead;
        beforeEach(done => {
            TaskHeadDBController.deleteAll(err => {

                test_members[0].userId = currentUserId;
                test_taskhead.orders[0].userId = currentUserId;
                TaskHeadDBController.create(test_taskhead, (err, newTaskHead) => {
                    taskHead = newTaskHead;
                    done();
                });

            });
        });

        it('DELETE /taskheads/:id returns 200', done => {
            console.log('taskhead - ', taskHead);
            request
                .delete('/taskheads/' + taskHead.id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
        it('DELETE /taskheads/wrongId returns 400', done => {
            request
                .delete('/taskheads/' + 'wrongId')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /taskheads/:id returns 400 - with wrong taskhead id', done => {
            const newMembers = [
                {id: 'id_member2', userId: 'stubbed_userId2', name: 'member2', email: 'email_member2', tasks: []}
            ];
            request
                .put('/taskheads/' + 'wrongId' + '/details')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({
                    id: test_taskhead.id,
                    title: test_taskhead.title,
                    color: test_taskhead.color,
                    members: newMembers
                })
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('PUT /taskheads/:id', done => {
            const newMembers = [
                {id: 'id_member2', userId: 'stubbed_userId2', name: 'member2', email: 'email_member2', tasks: []}
            ];
            request
                .put('/taskheads/' + taskHead.id + '/details')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({
                    id: test_taskhead.id,
                    title: test_taskhead.title,
                    color: test_taskhead.color,
                    members: newMembers
                })
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('PUT /taskheads/:id returns 400 - with existing members ', done => {
            let existingMembers = taskHead.members;
            request
                .put('/taskheads/' + taskHead.id + '/details')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send({
                    id: test_taskhead.id,
                    title: test_taskhead.title,
                    color: test_taskhead.color,
                    members: existingMembers
                })
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('PUT /taskheads/orders returns 200', done => {
            request
                .put('/taskheads/orders/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .send([
                    {taskHeadId: taskHead.id, orderNum: 2}
                ])
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
        it('PUT /taskheads/orders with no body returns 400', done => {
            request
                .put('/taskheads/orders/')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });

        it('DELETE /taskheads/member/:id returns 200', done => {
            request
                .delete('/taskheads/member/' + taskHead.members[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('DELETE /taskheads/member/:id  - without id returns 400', done => {
            let wrongMemberId = 'sdf';
            request
                .delete('/taskheads/member/' + wrongMemberId)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(400);
                    done();
                });
        });
    });

    describe('GET ', () => {

        const membersA = [
            {id: 'member0_id', userId: 'stubbed_userId0', name: 'member0', email: 'email_member0', tasks: []},
            {id: 'member1_id', userId: 'stubbed_userId1', name: 'member1', email: 'email_member1', tasks: []}
        ];
        const membersB = [
            {id: 'member1_id', userId: 'stubbed_userId1', name: 'member1', email: 'email_member1', tasks: []},
            {id: 'member2_id', userId: 'stubbed_userId2', name: 'member2', email: 'email_member2', tasks: []},
        ];

        const taskHeads = [
            {id: 'TaskHead0_id', title: 'titleOfTaskHead0', color: 222, members: membersA},
            {id: 'TaskHead1_id', title: 'titleOfTaskHead1', color: 222, members: membersB},
            {id: 'TaskHead2_id', title: 'titleOfTaskHead2', color: 222, members: membersB}
        ];

        let savedTaskHeads = [];
        beforeEach(done => {
            savedTaskHeads.length = 0;
            TaskHeadDBController.deleteAll(err => {

                // Create 3 taskHeads
                taskHeads.forEach((taskHead, i) => {
                    TaskHeadDBController.create(taskHead, (err, newTaskHead) => {
                        savedTaskHeads.push(newTaskHead);

                        if (taskHeads.length - 1 === i) {
                            done();
                        }
                    });
                });
            });
        });

        it('GET /taskheads/:with wrong member userid - returns 204', done => {
            request
                .get('/taskheads/' + 'wrong userid')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(204)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(204);
                    done();
                });
        });

        it('GET /taskheads/:userid - there is no taskheads of the member - returns 404', done => {
            // Delete All taskheads, no taskheads of 'member2'
            TaskHeadDBController.deleteAll(err => {
            });

            request
                .get('/taskheads/' + membersB[1].userId)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(204)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(204);
                    done();
                });
        });

        it('GET /taskheads/:userid - member0 - returns 200', done => {
            request
                .get('/taskheads/' + membersA[0].userId)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });

        it('Get /taskheads/:id returns 200', done => {
            request
                .get('/taskheads/?id=' + taskHeads[0].id)
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    res.body.should.have.property('id', 'TaskHead0_id');
                    done();
                });
        });

        it('Get /:id/members returns 200', done => {
            request
                .get('/taskheads/' + taskHeads[0].id + '/members')
                .set({Authorization: 'Bearer' + ' ' + accessToken})
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.status.should.equal(200);
                    done();
                });
        });
    });

});

describe('Delete taskHeads', () => {

    const members = [
        {id: 'id_member0', name: 'member0', email: 'email_member1', tasks: []},
        {id: 'id_member1', name: 'member1', email: 'email_member1', tasks: []},
    ];
    // console.log('currendUserId - ',currentUserId);
    // members[0].userId = currentUser.id;
    const taskHeads = [
        {id: 'stubIdOfTaskHead0', title: 'titleOfTaskHead0', color: 222, members: members},
        {id: 'stubIdOfTaskHead1', title: 'titleOfTaskHead1', color: 222, members: members},
        {id: 'stubIdOfTaskHead2', title: 'titleOfTaskHead2', color: 222, members: members}
    ];

    let savedTaskHeads = [];
    let accessToken;
    beforeEach(done => {
        // Register user first
        User.createMany((err, users) => {
            const loggedinUser = users[0];
            const otherUser = users[1];

            // Add Token
            Token.create(clientId, loggedinUser.id, predefine.oauth2.type.password, (err, newToken) => {
                accessToken = newToken.accessToken;

                savedTaskHeads.length = 0;
                TaskHeadDBController.deleteAll(err => {

                    members[0].userId = loggedinUser.id;
                    members[1].userId = otherUser.id;
                    // Create 3 taskHeads
                    taskHeads.forEach((taskHead, i) => {
                        TaskHeadDBController.create(taskHead, (err, newTaskHead) => {
                            savedTaskHeads.push(newTaskHead);

                            if (taskHeads.length - 1 === i) {
                                done();
                            }
                        });
                    });
                });
            });

        });
    });
    afterEach(done => {
        // delete all the users
        User.deleteAll(err => {
            Token.deleteAll(err => {
                done();
            });
        });
    });

    it('DELETE /taskheads/ returns 200', done => {

        // console.log('currentUserId- ', currentUserId);
        let ids = [];
        for (let i = 0; i < savedTaskHeads.length; i++) {
            ids.push(savedTaskHeads[i].id);
        }
        request
            .delete('/taskheads')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(200)
            .send({ids: ids})
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(200);
                done();
            });
    });

    it('DELETE /taskhead/ - deletingTaskHeadIds is undefined - returns 400', done => {
        request
            .delete('/taskheads/')
            .set({Authorization: 'Bearer' + ' ' + accessToken})
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                res.status.should.equal(400);
                done();
            });
    });
});
