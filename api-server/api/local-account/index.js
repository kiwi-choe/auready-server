const express = require('express');
const router = express.Router();

const controller = require('./local-account.controller.js');

// Set passport
require('../local-account/localPassportStrategy').setLocalSignup();
require('../local-account/localPassportStrategy').setLocalLogin();

router.post('/signup', controller.signup);
router.post('/login', controller.login);

module.exports = router;