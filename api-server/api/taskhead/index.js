const express = require('express');
const router = express.Router();

const passport = require('passport');
const oauth2Server = require(__appbase_dirname + '/auth-server/server');

const controller = require('./taskhead.controller');

// Create a taskHead
router.post('/',
    passport.authenticate('bearer', {session: false}), oauth2Server.error(),
    controller.createTaskHead);

module.exports = router;