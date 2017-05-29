const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/:memberid', controller.create);

// Update all tasks of a taskhead
router.put('/taskhead/:id', controller.updateOfTaskHead);
// Update tasks of a member
router.put('/member/:id', controller.updateOfMember);
// Get tasks of a member
router.get('/:memberid', controller.getTasksOfMember);

module.exports = router;