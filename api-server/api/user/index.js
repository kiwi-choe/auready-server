const express = require('express');
const router = express.Router();

const controller = require('./user.controller');

// GET users by string(name)
router.get('/:search', controller.getUsersByEmailOrName);
// router.get('/:search', (req, res) => {
//         let regexValue = req.params.search;
//         console.log(regexValue);
//         // Search using 'search'
//         User.find({'name': new RegExp(regexValue)}, (err, users) => {
//             if(err) res.sendStatus(400);
//             if(users.length === 0) {
//                 console.log('no users');
//                 return res.sendStatus(204);
//             }
//             console.log(users);
//             return res.status(200).json(users);
//         });
//     });

module.exports = router;
