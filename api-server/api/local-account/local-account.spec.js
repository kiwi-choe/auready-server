const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../bin/www');

describe('POST /local-account/signup', () => {

    it.only('should return 201 status code', (done) => {
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