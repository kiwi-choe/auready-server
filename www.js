// Set global objects
global.__appbase_dirname = __dirname;

console.log(__dirname);

const express = require('express');
const expressSession = require('express-session');
const app = express();
const bodyParser = require('body-parser');

const passport = require('passport');
const port = require('./predefine').port;

// load signup modules
const apiRouter = require(__appbase_dirname + '/api-server/index');
const database = require(__appbase_dirname + '/bin/database');
const authRouter = require(__appbase_dirname + '/auth-server/index');

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
// process.env.dbURI = 'dev';
database.initialize();
apiRouter.initialize(app);
authRouter.initialize(app);

const https = require('https');
const fs = require('fs');

const privateKey = __appbase_dirname + '/ssl/server.key.origin';
const publicCert = __appbase_dirname + '/ssl/server.crt';
const httpsConfig = {
	key: fs.readFileSync(privateKey),
	cert: fs.readFileSync(publicCert)
};

// http protocol
app.listen(port.httpPort, () => {
	console.log('auready-server listening on port ' + port.httpPort);
});
// https protocol
https.createServer(httpsConfig, app).listen(port.httpsPort, () => {
	console.log('auready-https-server listening on port ' + port.httpsPort);
});

module.exports = app;