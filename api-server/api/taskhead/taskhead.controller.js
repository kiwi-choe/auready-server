const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');

exports.create = (req, res) => {

    TaskHeadDBController.create(req.body.taskHeadInfo, (err, newTaskHead) => {
        if(err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

exports.deleteOne = (req, res) => {
    TaskHeadDBController.deleteOne(req.params.id, (err, isRemoved) => {
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

exports.updateDetails = (req, res) => {

    TaskHeadDBController.updateDetails(req.params.id, req.body.details, (err, result) => {
        if(err) {
            return res.sendStatus(401);
        }
        if(!result) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.deleteMulti = (req, res) => {

    TaskHeadDBController.deleteMulti(req.body.taskheadids, (err, isRemoved) => {
        if(err) {
            return res.sendStatus(401);
        }
        if(!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};