const passport = require('passport');
const oauth2Server = require(__appbase_dirname + '/auth-server/server');

// exports.index = () => {
//     passport.authenticate('bearer', {session: false}),
//         oauth2Server.error(),
//         (req, res) => {
//             console.log('send info of user after checking authorization');
//             console.log(req.user);
//             // res.json()
//
//             res.sendStatus(200);
//         };
// };