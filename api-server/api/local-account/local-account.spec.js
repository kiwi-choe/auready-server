process.env.dbURI = 'test';

const assert = require('assert');
const should = require('should');
const request = require('supertest');
const server = require('../../../www');

const User = require('../../../models/user.controller');
const Relationship = require('../../../models/relationship.controller');

const test_name = 'nameofkiwi3';
const test_email = 'kiwi3@gmail.com';
const test_password = '123';

describe('POST /local-account/signup', () => {

    afterEach(done => {
        // delete all the users
        User.deleteAll(err => {
            Relationship.deleteAll(err => {
                done();
            });
        });
    });

    it('should return 201 status code', (done) => {
        request(server)
            .post('/local-account/signup')
            .expect(201)
            .send({name: test_name, email: test_email, password: test_password})
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('name', test_name);
                res.body.should.have.property('email', test_email);
                done();
            });
    });

    it('should return 400 status code with msg:Missing credentials', (done) => {
        request(server)
            .post('/local-account/signup')
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe('POST /local-account/signup - already registered user test', () => {
    let currentUser;
    before(done => {
        // add some test data
        User.create(test_name, test_email, test_password, true, (err, user, info) => {
            currentUser = user;
            console.log(currentUser);
            done();
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            done();
        });
    });

    it('should return 400 status code with msg:registered user', (done) => {
        request(server)
            .post('/local-account/signup')
            .expect(400)
            .send({name: test_name, email: test_email, password: test_password})
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe('GET /local-account/login', () => {
    let currentUser;
    before(done => {
        // add some test data
        User.create(test_name, test_email, test_password, true, (err, user, info) => {
            currentUser = user;
            console.log(currentUser);
            done();
        });
    });
    after(done => {
        // delete all the users
        User.deleteAll(err => {
            done();
        });
    });

    it('should return 200 status code', (done) => {
        request(server)
            .get('/local-account/login')
            .expect(200)
            .send({email: test_email, password: test_password})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });

    it('should return 400 status code with unregistered email', (done) => {
        request(server)
            .get('/local-account/login')
            .expect(400)
            .send({email: 'unregistered email', password: '123'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });

    it('should return 400 status code with invalid password', (done) => {
        request(server)
            .get('/local-account/login')
            .expect(400)
            .send({email: test_email, password: 'invalid password'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });
});