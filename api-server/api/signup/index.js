const controller = require('./signup.controller');

module.exports = (router) => {

    router.post('/local', controller.local);

}