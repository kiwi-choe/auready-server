const express = require('express');
const router = express.Router();
const verifier = require('google-id-token-verifier');
const oauthInfo = require('./oauth-info');

var User = require(__appbase_dirname + '/models/user');

const temp_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImE4OGVjMjM3ZDYzMmJiMTJiMDgxNzRjNjY4Y2RkMmMzOGNlNzJiNWIifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc5NzQ0NTIsImV4cCI6MTQ3Nzk3ODA1MiwiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.b0FYTPsku35aXrR-13_kAvvcX2kvHW6yJjTIDFfud7Hsp1jthrZ0tRxyuBiTWDuwAXZhrHhrwGH2HVdqiDW4I3KlYzqfD2giq3SHLWa7xkoCFLSVs-OBv6TWHvZodowIVuM57dJmP4xxOpGJP2Ji1w1HcZnMUe_nTU0O3tKQ-RQ4F4kWf0FCVtMoN8JtZT13IoO4hfnswmSkLlHhSh66_HAsr1KSWNi94e-NzxweSef4fLB7Y0_KB4bv4MaBNwK3OerIgo9wWis1oYRDkwULN21S-gerhYTu1UI8RgnKoat1Woi90wZH1E5PqbPLY2v6Sng0rpVK71XtHXgv44RyZw';

router.post('/login/:socialapp', (req, res) => {

    var registerSocialAccount = (userinfo, done) => {
        // Save user
        User.findOne({'password': userinfo.password}, (err, user) => {
            if (err) return done(err);
            if (user) {
                console.log('this user already exists!');
                return done(null, user);
            } else {
                console.log('user not found');
            }

            let newUser = new User(userinfo);
            newUser.save((err) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                return done(null, newUser);
            });
        });
    };

    const verifyGoogleAccount = (req, res) => {
        // Calling tokeninfo endpoint to verify id_token
        verifier.verify(req.body.id_token, oauthInfo.google.clientId, (err, tokenInfo) => {
        // verifier.verify(temp_id_token, oauthInfo.google.clientId, (err, tokenInfo) => {
            if (err) {
                console.log(err);
                res.sendStatus(402);    // google server error
            }
            // Register social account to User
            console.log(tokenInfo);
            let userinfo = {
                name: tokenInfo.name,
                email: tokenInfo.email,
                password: req.body.id_token
            };
            registerSocialAccount(userinfo, done => {
                res.status(200).json(userinfo);
            });
        });
    };

    switch (req.params.socialapp) {
        case 'google':
            verifyGoogleAccount(req, res);
            break;

        default:
            console.log('unknown socialapp');
            return res.sendStatus(400);
    }
});

module.exports = router;