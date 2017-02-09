const express = require('express');
const router = express.Router();

const controller = require('./user.controller');

// GET users by string(name)
router.get('/:search', controller.getUsersByEmailOrName);

module.exports = router;
