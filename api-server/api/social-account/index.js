const express = require('express');
const router = express.Router();
const verifier = require('google-id-token-verifier');
const oauthInfo = require('./oauth-info');

var User = require(__appbase_dirname + '/models/user');

const temp_id_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlmYjk4ZGY3NDg2ZTJjNTg4NjdjNzA0ODVmODM1MDMzNGQxMmQ5NzcifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJpYXQiOjE0Nzc2Mjc1OTIsImV4cCI6MTQ3NzYzMTE5MiwiYXVkIjoiODUxMTQwNjAxNDYwLWZxYnIyNnJqa29yOWFiNTU3bDZsNHZybWJnM2JoNGdpLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NjQ4NzgxMjExMjczNjQ1MDIyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6Ijg1MTE0MDYwMTQ2MC00a3FqZjBsM3MyZ2ozb2RlYm0xYXYwdWUyOW5jbDhvNy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImVtYWlsIjoibWFnbWFnMDIyMUBnbWFpbC5jb20iLCJuYW1lIjoi7LWc7KeA7JuQIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tWFBOMzVPVVVLLUkvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUtUYWVLOXoyMXFvLUdLYUpvUU9lbnhsNXI4UEV4ajVlUS9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoi7KeA7JuQIiwiZmFtaWx5X25hbWUiOiLstZwiLCJsb2NhbGUiOiJrbyJ9.LArpT3NgvvEGnw-ouDOTfSBpO7FYSfFEMbqp7XG-cOo0sVeMZSjqi4jt_Evem6NA3NwodhIsjCoPobbFXkC3uJEMcqu2pEqe_se8ge9xbAmYTsK2i9EFzv3ujmDtuDogPEZWZLfqJ4Fd-k9sBTBJMc5uPx1tKCpecg_5kof1KswkmvIrvRAjVuAQL6nzS6L5Pves1e8bFZAPlJ0GJ8-lWbsZpk7DRvUdKUFlPtcuzqw3sfj4M-FT7W2vOybRMcnc7rnC2GzH0iSfly457epvPocn8wrkuMCiF29a8nOVBeLso5TP-QNTGyJZPnWa6K5SKiia6lD2ryqnwdPHTOcFGw';

router.post('/login/:socialapp', (req, res) => {

    var registerSocialAccount = (socialname, info, done) => {
        // Save user
        let search = JSON.parse("{ \"" + socialname + ".id\": \"" + info.id + "\" }");
        User.findOne(search, (err, user) => {
            if (err) return done(err);
            if (user) {
                console.log(socialname + ' account already exists!');
                return done(null, user);
            } else {
                console.log('user not found');
            }

            let newUser = new User();
            eval('newUser.' + socialname + ' = info');
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
            // res.sendStatus(200);
            registerSocialAccount('google', {
                id: tokenInfo.sub,
                token: req.body.id_token,
                name: tokenInfo.name,
                email: tokenInfo.email
            }, done => {
                //done();
                res.sendStatus(200);
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