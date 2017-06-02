const express = require('express');
const router = express.Router();

const controller = require('./task.controller');

router.post('/:memberid', controller.create);

// Update all tasks of a taskhead; description only if the task exists
router.put('/taskhead/:id', controller.updateOfTaskHead);

// Update tasks of a member
router.put('/member/:id', controller.updateOfMember);

// Add a new task
router.put('/member/:id/add', controller.addTask);

// Delete a task
router.put('/member/:memberid/del/:id', controller.deleteTask);

// Get tasks of a member
router.get('/:memberid', controller.getTasksOfMember);

module.exports = router;