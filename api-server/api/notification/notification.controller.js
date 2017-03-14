const User = require(__appbase_dirname + '/models/user.controller');

exports.register = (req, res) => {
    console.log('post /notifications/:instanceId');
    const instanceId = req.params.instanceId;
    User.updateInstanceId(req.user._id, instanceId, (err, updatedUser) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!updatedUser) {
            console.log('update fail');
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};