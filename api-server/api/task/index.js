const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/:memberid', controller.create);

// Delete tasks
router.delete('/', controller.deleteMulti);

// Update all
router.put('/:id', controller.update);

module.exports = router;