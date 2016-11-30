const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/', controller.create);
router.delete('/', controller.deleteAll);
router.delete('/:id', controller.delete);

// Update all
router.put('/', controller.update);

module.exports = router;