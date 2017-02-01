const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');

exports.create = (req, res) => {

    TaskHeadDBController.create(req.body.taskHeadInfo, (err, newTaskHead) => {
        if(err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

exports.delete = (req, res) => {
    TaskHeadDBController.delete(req.params.id, (err, isRemoved) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.update = (req, res) => {

    TaskHeadDBController.updateDetails(req.params.id, req.body.details, (err, result) => {
        if(err) {
            return res.sendStatus(401);
        }
        if(!result) {
            console.log(result);
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};
