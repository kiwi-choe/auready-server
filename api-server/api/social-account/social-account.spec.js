const assert = require('assert');
const should = require('should');
const request = require('supertest');

const server = require('../../../www');

const temp_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjczZTMzNmE2ZmMwYTk1MDFjMzBiNGRhOGZlMDM4OGM2NjZjYWQ2YjQifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc3MTY3MjcsImV4cCI6MTQ3NzcyMDMyNywiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.ZK3yPWoH9XSvb4SjT1VL3cKsPZQG-p17mpodXASzgg_ymbwibCL8HzS3QkOKwcT5mKsWmh6ar6SCdTp30BwQ7vw3q_Zbnb2nd97CDHCkrZtKG6_BErnHCRrXTGA0WP53zI5cZE04l2vDjlG5XmkrqSM79KmzKj-hikzSxAK0CEqoOzVVbZr00GpDhmxR4XKDtufej4oXk9uutz5PMoGr3smd_ARcpAS5ogrlz4hJ6v-K804Eryaglm9ebRbDRi7wXJmsDFz9ICjdpgvHuPgRsp_VrMKQcbK-bxNgjdjL0KuxoRZ8dUwIzHVbJvROHXddZt5rwBy62sX4oAKrRMoppQ';

describe('POST /social-account/login/:socialapp', () => {
    it(':socialapp = google, return 200 code, body contains the JSON-data ID token claims.', done => {
        request(server)
            .post('/social-account/login/google')
            .send({id_token: temp_id_token})
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                done();
            });
    });
});