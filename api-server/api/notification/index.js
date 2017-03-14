const express = require('express');
const router = express.Router();

const controller = require('./notification.controller');

router.post('/:instanceId', controller.register);

module.exports = router;