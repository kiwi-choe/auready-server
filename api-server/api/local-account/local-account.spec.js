const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../www');

const test_name = 'nameofkiwi3';
const test_email = 'kiwi3@gmail.com';
const test_password = '123';

describe('POST /local-account/signup', () => {

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

    it('should return 403 status code with msg:Missing credentials', (done) => {
        request(server)
            .post('/local-account/signup')
            .expect(403)
            .end((err, res) => {
                if (err) throw err;
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

describe('POST /local-account/login', () => {
    it('should return 200 status code', (done) => {
        request(server)
            .post('/local-account/login')
            .expect(200)
            .send({email: test_email, password: test_password})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });

    it('should return 400 status code with unregistered email', (done) => {
        request(server)
            .post('/local-account/login')
            .expect(400)
            .send({email: 'unregistered email', password: '123'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });

    it('should return 400 status code with invalid password', (done) => {
        request(server)
            .post('/local-account/login')
            .expect(400)
            .send({email: test_email, password: 'invalid password'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });
});