const UserDBController = require(__appbase_dirname + '/models/user.controller');
const UserModel = require(__appbase_dirname + '/models/user');
const Relationship = require(__appbase_dirname + '/models/relationship.controller');
const Status = Relationship.statusValues;

exports.getUsersByEmailOrName = (req, res) => {

    let regexValue = req.params.search;
    console.log(regexValue);
    const loggedInUserId = req.user.id;

    // Search using 'search'
    UserDBController.readByEmailOrName(regexValue, (err, users) => {
        if (err) {
            return res.sendStatus(400);
        }

        if(!users) {
            console.log('no users');
            return res.sendStatus(204);
        }

        // check that logged in user id and found users are in relationship collection
        let userAndStatusArr = [];
        userAndStatusArr.length = 0;

        users.forEach((user, i) => {
            Relationship.readStatus(loggedInUserId, user.id, (err, status) => {
                if (err) {
                    return res.sendStatus(400);
                }
                // Make array
                let userAndStatus = {
                    userInfo: {
                        id: String,
                        email: String,
                        name: String
                    },
                    status: Number
                };

                userAndStatus.userInfo = {id: user.id, email: user.email, name: user.name};
                if (status === Status.NO_STATUS|| status === Status.PENDING) {
                    userAndStatus.status = status;
                }
                else {
                    console.log('already friends');
                    return false;
                }
                userAndStatusArr.push(userAndStatus);

                if (users.length - 1 === i) {
                    // returns 'users' and 'status of each users'
                    console.log('\nuserAndStatusArr - ', userAndStatusArr);
                    return res.status(200).json(userAndStatusArr);
                }
            });
        });
    });
};

exports.getUsersByIds = (ids, done) => {
    // UserDBController.read
    let foundUsers = [];
    ids.forEach((id, i) => {
        UserDBController.readById(id, (err, user) => {
            if (err) return done(err, null);
            foundUsers.push(user);

            if (i === ids.length - 1) {
                return done(null, foundUsers);
            }
        });

    });

};
