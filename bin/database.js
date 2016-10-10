const mongoose = require('mongoose');
const dbUrl = 'mongodb://localhost:27017/aureadydb';

module.exports.initialize = () => {
    mongoose.connect(dbUrl);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        console.log("mongo db connection OK.");
    });
}