const assert = require('assert');
const should = require('should');

const server = require('../www');
const request = require('supertest')(server);

const temp_google_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlmYjk4ZGY3NDg2ZTJjNTg4NjdjNzA0ODVmODM1MDMzNGQxMmQ5NzcifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc2Mjc1OTIsImV4cCI6MTQ3NzYzMTE5MiwiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.LArpT3NgvvEGnw-ouDOTfSBpO7FYSfFEMbqp7XG-cOo0sVeMZSjqi4jt_Evem6NA3NwodhIsjCoPobbFXkC3uJEMcqu2pEqe_se8ge9xbAmYTsK2i9EFzv3ujmDtuDogPEZWZLfqJ4Fd-k9sBTBJMc5uPx1tKCpecg_5kof1KswkmvIrvRAjVuAQL6nzS6L5Pves1e8bFZAPlJ0GJ8-lWbsZpk7DRvUdKUFlPtcuzqw3sfj4M-FT7W2vOybRMcnc7rnC2GzH0iSfly457epvPocn8wrkuMCiF29a8nOVBeLso5TP-QNTGyJZPnWa6K5SKiia6lD2ryqnwdPHTOcFGw';
const accessToken = 'temp_access_token';
const config = {

    headerForReqAuth: {
        Authorization: 'Basic dEVZUUFGaUFBbUxyUzJEbDpZbUUyTFlUR0t1bmxWVzVPcktObFdGOUtRWlVaT0hEeQ=='
    },

    headerForApi: {
        Authorization: 'Bearer' + ' ' + accessToken
    },

    bodyForAuthLocal: {
        client_id: 'tEYQAFiAAmLrS2Dl',
        client_secret: 'YmE2LYTGKunlVW5OrKNlWF9KQZUZOHDy',
        grant_type: 'password',
        username: 'kiwi',
        password: '123'
    },

    bodyForAuthGoogle: {
        client_id: 'tEYQAFiAAmLrS2Dl',
        client_secret: 'YmE2LYTGKunlVW5OrKNlWF9KQZUZOHDy',
        grant_type: 'password',
        username: 'google',
        password: temp_google_id_token
    }
};

// Local
describe('POST /auth/token', () => {
    it('should return 200 code and return access token', done => {
        request
            .post('/auth/token')
            .set(config.headerForReqAuth)
            .send(config.bodyForAuthLocal)
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
            .send(config.bodyForAuthLocal)
            .expect(401)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});

// Social - google
describe('POST /auth/token: social-google', () => {
    it('should return 200 code and return access token', done => {
        request
            .post('/auth/token')
            .set(config.headerForReqAuth)
            .send(config.bodyForAuthGoogle)
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
            .send(config.bodyForAuthLocal)
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

