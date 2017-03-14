process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
require('../../../www');

const User = require('../../../models/user');
const UserController = require('../../../models/user.controller');

describe('Update', () => {

    let savedUser;
    before(done => {
        const user = {name: 'nameofkiwi1', email: 'kiwi1@gmail.com', password: '123', isLocalAccount: true};
        // create 4 users
        UserController.create(user.name, user.email, user.password, user.isLocalAccount, (err, newUser) => {
            savedUser = newUser;
            console.log('savedUser- ', savedUser);
            done();
        });
    });

    it('update instanceId field', done => {
        let instanceId = 'stub_instanceId';
        UserController.updateInstanceId(savedUser.id, instanceId, (err, updatedUser) => {
            if(err) {
                assert.ifError(err);
            }
            if(!updatedUser) {
                assert.fail('isupdated is false');
            }
            console.log('\nupdatedUser- ', updatedUser);
            done();
        });
    });


    after(done => {
        // delete all the users
        UserController.deleteAll(err => {
            done();
        });
    });
});
