const TaskHeadDBController = require(__appbase_dirname + '/models/taskhead.controller');

exports.createTaskHead = (req, res) => {

    TaskHeadDBController.create(req.body.taskHeadInfo, (err, newTaskHead) => {
        if(err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

