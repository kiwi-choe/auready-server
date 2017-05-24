const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/:memberid', controller.create);

// Delete a task
router.delete('/:id', controller.delete);

// Update all tasks of a taskhead
router.put('/taskhead/:id', controller.updateOfTaskHead);
// Update tasks of a member
router.put('/member/:id', controller.updateOfMember);
// Update a task - change completed
router.put('/:id', controller.changeCompletedOfTask);
// Get tasks of a member
router.get('/:memberid', controller.getTasksOfMember);

module.exports = router;