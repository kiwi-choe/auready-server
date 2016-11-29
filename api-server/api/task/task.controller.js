const TaskDBController = require(__appbase_dirname + '/models/task.controller');

exports.create = (req, res) => {
    TaskDBController.create(req.body.taskInfo, (err, newTask) => {
        if(err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

exports.deleteAll = (req, res) => {
    TaskDBController.deleteAll(err => {
        if(err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};

exports.delete = (req, res) => {
    TaskDBController.delete(req.params.id, (err, isRemoved) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!isRemoved) {
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};


exports.update = (req, res) => {

    const updatingTask = req.body.task;
    const query = {_id: updatingTask._id};
    const options = updatingTask;
    TaskDBController.update(query, options, (err, result) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!result.n) {
            return res.sendStatus(400);
        } else {
            return res.status(200).send(updatingTask);
        }
    });
};