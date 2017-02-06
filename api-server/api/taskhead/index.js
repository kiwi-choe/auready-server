const express = require('express');
const router = express.Router();

const controller = require('./taskhead.controller');

router.post('/', controller.create);

router.delete('/:id', controller.deleteOne);

// Update details - title, members
router.put('/:id', controller.updateDetails);

// Delete tasks
router.delete('/', controller.deleteMulti);

// Delete a member - [나가기] 기능
router.put('/:taskheadid/member/:memberid', controller.deleteMember);

// Read taskHeads of the user

module.exports = router;