const express = require('express');
const router = express.Router();

const controller = require('./taskhead.controller');

router.post('/', controller.create);

router.delete('/:id', controller.delete);

// Update all(title, order, members)
router.put('/', controller.update);

module.exports = router;