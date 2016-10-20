// Set global objects
global.__appbase_dirname = __dirname;

const express = require('express');
const expressSession = require('express-session');
const app = express();
const bodyParser = require('body-parser');

const passport = require('passport');

const port = 3000;

// load signup modules
const apiRouter = require('../api-server');
const database = require('../bin/database');
const authRouter = require('../auth-server');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(expressSession({
	secret: 'keyboard cat',
	key: 'sid',
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Add middleware for authentication
database.initialize();
apiRouter.initialize(app);
authRouter.initialize(app);

app.listen(port, () => {
	console.log('auready-server listening on port 3000');
});

module.exports = app;