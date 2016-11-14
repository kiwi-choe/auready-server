const User = require(__appbase_dirname + '/models/user');
const bcrypt = require('bcrypt-nodejs');

// generating a hash
const generateHash = password => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

const _create = (name, email, password, isLocalAccount, done) => {
    if(isLocalAccount) {
        password = generateHash(password);
    }
    let newUser = new User({name, email, password});
    newUser.save((err) => {
        if(err) return done(err);
        return done(null, newUser);
    });
};

const _deleteAll = done => {
    User.remove({}, err => {
        if(err) return done(err);
        return done(null);
    });
};

const _readAll = done => {
    User.find({}, (err, users) => {
        if(err) {
            return done(err);
        }
        return done(null, users);
    });
};

module.exports = {
    create: _create,
    deleteAll: _deleteAll,
    readAll: _readAll
}