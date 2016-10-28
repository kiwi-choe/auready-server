const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../www');

const temp_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkxM2NhNzJiNmViYzQ1NWE1MTMyZDkzNGZjMzRhNmNiNGQ2YTJmMjMifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc1NTU5NTYsImV4cCI6MTQ3NzU1OTU1NiwiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.Pyqi1jhFHuRMO1MM8R9arj50X43G3hegPQkpp4-jaN630azEncSRtu5U0sRLP_1HJBkhtu5JZGrfXNb70o3kiLWGtWTJTJ4JCFTd1-k4gMdqISdr9PafmQB0xGPkP2LO3MXPWDl4BORbj0CrEFdNWgvv2vKKshM8_ffajPGOYGo3y0iMVq5GaNQEJZOEaAnIYl1CLaOxWh3LJI2AuGUtM9BL71MTGS5D-Koc1vsZBymFLj6S2dZkjDL6WO4W5JqzohsgfaEpN_iTKlMrjSMA3EWWsFdEpy7YULe85hWkJTnDIvbW9wnzVWo6yc_6FRJJjTEAX2AATRFyDrGlHDrePA';

describe('POST /social-account/login/:socialapp', () => {
    it(':socialapp = google, return 200 code, body contains the JSON-data ID token claims.', done => {
        request(server)
            .post('/social-account/login/google')
            .send({id_token: temp_id_token})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.properties('iss', 'exp', 'email', 'name');
                done();
            });
    });
});