const User = require(__appbase_dirname + '/models/user');
const bcrypt = require('bcrypt-nodejs');

// generating a hash
const generateHash = password => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

const _create = (name, email, password, isLocalAccount, done) => {
    if (isLocalAccount) {
        password = generateHash(password);
    }
    let newUser = new User({name, email, password});
    newUser.save((err) => {
        if (err) return done(err);
        return done(null, newUser);
    });
};

/*
 * fixme for testing only
 * */
const _createMany = (done) => {

    let loggedinuser = {name: 'nameofkiwi', email: 'kiwi@gmail.com', password: '123'};
    let otheruser = {name: 'nameofkiwi2', email: 'kiwi2@gmail.com', password: '123'};
    loggedinuser.password = generateHash(loggedinuser.password);
    otheruser.password = generateHash(otheruser.password);

    let userArr = [loggedinuser, otheruser];
    User.insertMany(userArr, (err, users) => {
        if(err) return done(err);
        return done(null, users);
    });
};

const _deleteAll = done => {
    User.remove({}, err => {
        if (err) return done(err);
        return done(null);
    });
};

const _readAll = done => {
    User.find({}, (err, users) => {
        if (err) {
            return done(err);
        }
        return done(null, users);
    });
};

module.exports = {
    create: _create,
    createMany: _createMany,
    deleteAll: _deleteAll,
    readAll: _readAll
}