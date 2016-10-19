const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../bin/www');

describe('POST /local-account/signup', () => {

    it('should return 201 status code', (done) => {
        request(server)
            .post('/local-account/signup')
            .expect(201)
            .send({email: 'kiwi', password: '123'})
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('should return 400 status code', (done) => {
        request(server)
            .post('/local-account/signup')
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe.only('POST /local-account/login', () => {
    it('should return 200 status code', (done) => {
        request(server)
            .post('/local-account/login')
            .expect(200)
            .send({email: 'kiwi', password: '123'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });

    it.only('should return 400 status code with unregistered email', (done) => {
        request(server)
            .post('/local-account/login')
            .expect(400)
            .send({email: 'unregistered email', password: '123'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });

    it.only('should return 400 status code with invalid password', (done) => {
        request(server)
            .post('/local-account/login')
            .expect(400)
            .send({email: 'kiwi', password: 'invalid password'})
            .end((err, res) => {
                if(err) throw err;
                done();
            });
    });
});