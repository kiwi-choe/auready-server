const express = require('express');
const router = express.Router();

const controller = require('./user.controller');

// GET all users
router.get('/', controller.index);

module.exports = router;
