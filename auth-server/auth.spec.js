const assert = require('assert');
const should = require('should');

const server = require('../bin/www');
const request = require('supertest')(server);


const accessToken = 'temp_access_token';
const config = {

    headerForReqAuth: {
        Authorization: 'Basic dEVZUUFGaUFBbUxyUzJEbDpZbUUyTFlUR0t1bmxWVzVPcktObFdGOUtRWlVaT0hEeQ=='
    },

    headerForApi: {
        Authorization: 'Bearer' + ' ' + accessToken
    },

    bodyForAuth: {
        client_id: 'tEYQAFiAAmLrS2Dl',
        client_secret: 'YmE2LYTGKunlVW5OrKNlWF9KQZUZOHDy',
        grant_type: 'password',
        username: 'kiwi',
        password: '123'
    }
};

describe('POST /auth/token', () => {
    it('should return 200 code and return access token', done => {
        request
            .post('/auth/token')
            .set(config.headerForReqAuth)
            .send(config.bodyForAuth)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.properties('access_token', 'token_type', 'expires_in', 'refresh_token');
                done();
            });
    });

    it('should return 401(Unauthorized) code without Authorization header', done => {
        request
            .post('/auth/token')
            .send(config.bodyForAuth)
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

describe('DELETE /auth/token', () => {
    it('should return 200 code and return access token', done => {
        request
            .delete('/auth/token')
            .set({Authorization: 'Bearer ' + 'XzC0wn6rFFgD7H81hogf2STZJEl3VFogqCduvsG8Qys19KQuLJpBC9Yn8zuyDQVfO92QmaAGX4FQYcCpOjc4ubAkNhTz5kHqVVtKdmyAdr8BPtFQGq3rIqcDK92KcXT6UE9MauQYgEMzDreuspzy0KKXYVUvcn6sYReSHSEB0caLqAMAlcHc7gpNpc7usdZTFZPlimNaJPwVKOtRFUftpHx6VwcFSGOA059sVgR6ZtHoNSRWoZR57hvZFqi0VJU6'})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('should return 401(Unauthorized) code without Authorization header', done => {
        request
            .delete('/auth/token')
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    it('should return 403(Unauthorized) code with the wrong access token', done => {
        request
            .delete('/auth/token')
            .set({Authorization: 'Bearer ' + 'wrong_access_token'})
            .expect(403)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

