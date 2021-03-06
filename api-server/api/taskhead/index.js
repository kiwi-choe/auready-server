const express = require('express');
const router = express.Router();

const controller = require('./taskhead.controller');

router.post('/', controller.create);

router.delete('/:id', controller.deleteOne);

// Update details - title, members
router.put('/:id/details', controller.updateDetails);
// Update orders
router.put('/orders', controller.updateOrders);

// Delete taskheads
router.delete('/', controller.deleteMulti);

// Delete a member - [나가기] 기능
router.delete('/member/:id', controller.deleteMember);

router.get('/:id/members', controller.getMembers);

// Read taskHeads of the user - search by members.name
router.get('/:userid', controller.getTaskHeads);

// Read a taskHead by query id
router.get('/', controller.getTaskHead);

module.exports = router;