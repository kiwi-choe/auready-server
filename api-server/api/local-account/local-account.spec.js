const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../bin/www');

describe('POST /signup-account/signup', () => {
    it('should return 201 status code', (done) => {
        request(server)
            .post('/signup-account/signup')
            .expect(201)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    // it('should return 400 status code', (done) => {
    //     request(server)
    //         .post('/signup-account/signup')
    //         .expect(400)
    //         .end((err, res) => {
    //             if (err) throw err;
    //             done();
    //         });
    // });
});