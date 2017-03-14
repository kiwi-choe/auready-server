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
        if (err) return done(err);
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

const _readById = (id, done) => {
    User.findOne({_id: id}, (err, user) => {
        if (err) throw err;
        return done(null, user);
    });
};

const _readByEmailOrName = (search, done) => {
    User.find().or([
        {'email': new RegExp(search)},
        {'name': new RegExp(search)}
    ]).exec((err, users) => {
        if (err) return done(err);
        if (users.length === 0) {
            return done(null, false);
        }
        return done(null, users);
    });
};

const _updateInstanceId = (id, instanceId, done) => {
    User.findOne({_id: id}, (err, user) => {
        if(err) {
            return done(err);
        }
        // update the found user
        user.instanceId = instanceId;
        user.save((err, updatedUser) => {
            if(err) {
                return done(err);
            }
            if(updatedUser) {
                return done(null, updatedUser);
            }
            return done(null, false);
        });
    });
};

module.exports = {
    create: _create,
    createMany: _createMany,
    deleteAll: _deleteAll,
    readAll: _readAll,
    readById: _readById,
    readByEmailOrName: _readByEmailOrName,
    updateInstanceId: _updateInstanceId
}