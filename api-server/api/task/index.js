const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/', controller.create);

// Delete tasks
router.delete('/', controller.deleteMulti);

// Delete a task
router.delete('/:id', controller.delete);

// Update all
router.put('/', controller.update);

module.exports = router;