const express = require('express');
const router = express.Router();

const controller = require('./notification.controller');

router.post('/:instanceId', controller.register);

// Notify AUReady to the member
router.get('/auready/:userId', controller.auready);

module.exports = router;