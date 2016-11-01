const assert = require('assert');
const should = require('should');

const server = require('../www');
const request = require('supertest')(server);

const test_google_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImE4OGVjMjM3ZDYzMmJiMTJiMDgxNzRjNjY4Y2RkMmMzOGNlNzJiNWIifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc5NzQ0NTIsImV4cCI6MTQ3Nzk3ODA1MiwiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.b0FYTPsku35aXrR-13_kAvvcX2kvHW6yJjTIDFfud7Hsp1jthrZ0tRxyuBiTWDuwAXZhrHhrwGH2HVdqiDW4I3KlYzqfD2giq3SHLWa7xkoCFLSVs-OBv6TWHvZodowIVuM57dJmP4xxOpGJP2Ji1w1HcZnMUe_nTU0O3tKQ-RQ4F4kWf0FCVtMoN8JtZT13IoO4hfnswmSkLlHhSh66_HAsr1KSWNi94e-NzxweSef4fLB7Y0_KB4bv4MaBNwK3OerIgo9wWis1oYRDkwULN21S-gerhYTu1UI8RgnKoat1Woi90wZH1E5PqbPLY2v6Sng0rpVK71XtHXgv44RyZw';
const accessToken = 'temp_access_token';

const test_email = 'kiwi2@gmail.com';
const test_password = '123';

const config = {

    headerForReqAuth: {
        Authorization: 'Basic dEVZUUFGaUFBbUxyUzJEbDpZbUUyTFlUR0t1bmxWVzVPcktObFdGOUtRWlVaT0hEeQ=='
    },

    bodyForAuthLocal: {
        client_id: 'tEYQAFiAAmLrS2Dl',
        client_secret: 'YmE2LYTGKunlVW5OrKNlWF9KQZUZOHDy',
        grant_type: 'password',
        username: test_email,
        password: test_password
    },

    bodyForAuthGoogle: {
        client_id: 'tEYQAFiAAmLrS2Dl',
        client_secret: 'YmE2LYTGKunlVW5OrKNlWF9KQZUZOHDy',
        grant_type: 'password',
        username: 'google',
        password: test_google_id_token
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

