const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const dbURI = {
    dev: 'mongodb://localhost:27017/aureadydb',
    test: 'mongodb://localhost:27017/aureadydb_test'
};

exports.initialize = () => {
    mongoose.connect(dbURI[process.env.dbURI]);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('Connected to database: ' + dbURI[process.env.dbURI]);
    });
};