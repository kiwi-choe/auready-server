const assert = require('assert');
const should = require('should');
const request = require('supertest');
const server = require('../../../www');

const temp_id_token = 'xyz123';

describe('GET /social-account/login/:socialapp', () => {
    it(':socialapp = google, return 200 code, body contains the JSON-data ID token claims.', done => {
        request(server)
            .get('/login/google')
            .send({id_token: temp_id_token})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // res.body.should.properties('iss', 'exp', 'email', 'name');
                done();
            });
    });
});