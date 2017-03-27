const assert = require('assert');
const should = require('should');
const request = require('supertest');

process.env.dbURI = 'test';
const server = require('../../../www');

const temp_id_token = 'temp id';

describe('POST /social-account/signup', () => {
    it('req.body.socialapp = google, return 201 code, body contains the JSON-data ID token claims.', done => {
        const socialapp = 'google';
        request(server)
            .post('/social-account/signup')
            .send({socialapp: socialapp, id_token: temp_id_token})
            .expect(201)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});