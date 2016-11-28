const express = require('express');
const router = express.Router();

const controller = require('./taskhead.controller');

router.post('/', controller.create);

router.delete('/:id', controller.delete);

// Edit all(title, order, members)
router.put('/', controller.edit);

module.exports = router;