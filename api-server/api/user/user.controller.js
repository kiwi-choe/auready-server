const UserDBController = require(__appbase_dirname + '/models/user.controller');

exports.getUsersByEmailOrName = (req, res) => {

    let regexValue = req.params.search;
    console.log(regexValue);
    // Search using 'search'
    UserDBController.readByEmailOrName(regexValue, (err, users) => {
        if (err) {
            return res.sendStatus(400);
        }

        if (!users) {
            console.log('no users');
            return res.sendStatus(204);
        }
        console.log(users);
        return res.status(200).json(users);
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
