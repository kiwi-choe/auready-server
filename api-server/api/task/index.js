const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/:memberid', controller.create);

// Delete tasks
router.delete('/', controller.deleteMulti);

// Update all tasks of the certain member
router.put('/:memberid', controller.update);

module.exports = router;