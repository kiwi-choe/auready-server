const User = require(__appbase_dirname + '/models/user');
const bcrypt = require('bcrypt-nodejs');

// generating a hash
const generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// register Local a user
const _createLocal = (name, email, password, done) => {
    User.findOne({'email': email},
        (err, user) => {
            if(err) {
                return done(err);
            }
            if(user) {
                console.log('WARNING! an user with email exists');
                return done(null, false, {reason: 'registered user'});
            }
            password = generateHash(password);
            let newUser = new User({name, email, password});
            newUser.save((err) => {
                if(err) return done(err);
                return done(null, newUser);
            });
        });
};
// register Social a user if already loggedin or not
const _createSocial = (userinfo, done) => {
    User.findOne({'password': userinfo.password},
        (err, user) => {
            if(err) {
                return done(err);
            }
            if(user) {
                console.log('this social account already exists, just pass this userinfo');
                return done(null, user);
            }
            let newUser = new User({
                'name': userinfo.name,
                'email': userinfo.email,
                'password': userinfo.password
            });
            newUser.save((err) => {
                if(err) return done(err);
                return done(null, newUser);
            });
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
    createLocal: _createLocal,
    createSocial: _createSocial,
    deleteAll: _deleteAll,
    readAll: _readAll
}