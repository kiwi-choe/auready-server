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
        // we're connected!
        console.log('Connected to database: ' + dbURI[process.env.dbURI]);
    });
    // const db = mongoose.createConnection(dbURI[process.env.dbURI], (err, res) => {
    //     if(err){
    //         console.log('Error connecting to the db: ' + err);
    //     } else {
    //         console.log('Connected to database: ' + dbURI[process.env.dbURI]);
    //     }
    // });
};