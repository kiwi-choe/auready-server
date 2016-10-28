const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../www');

const temp_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlmYjk4ZGY3NDg2ZTJjNTg4NjdjNzA0ODVmODM1MDMzNGQxMmQ5NzcifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc2Mjc1OTIsImV4cCI6MTQ3NzYzMTE5MiwiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.LArpT3NgvvEGnw-ouDOTfSBpO7FYSfFEMbqp7XG-cOo0sVeMZSjqi4jt_Evem6NA3NwodhIsjCoPobbFXkC3uJEMcqu2pEqe_se8ge9xbAmYTsK2i9EFzv3ujmDtuDogPEZWZLfqJ4Fd-k9sBTBJMc5uPx1tKCpecg_5kof1KswkmvIrvRAjVuAQL6nzS6L5Pves1e8bFZAPlJ0GJ8-lWbsZpk7DRvUdKUFlPtcuzqw3sfj4M-FT7W2vOybRMcnc7rnC2GzH0iSfly457epvPocn8wrkuMCiF29a8nOVBeLso5TP-QNTGyJZPnWa6K5SKiia6lD2ryqnwdPHTOcFGw';

describe('POST /social-account/login/:socialapp', () => {
    it(':socialapp = google, return 200 code, body contains the JSON-data ID token claims.', done => {
        request(server)
            .post('/social-account/login/google')
            .send({id_token: temp_id_token})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                // res.body.should.properties('iss', 'exp', 'email', 'name');
                done();
            });
    });
});