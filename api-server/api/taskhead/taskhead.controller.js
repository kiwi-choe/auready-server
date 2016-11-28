const TaskHeadDBController = require(__appbase_dirname + '/models/taskhead.controller');

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

exports.edit = (req, res) => {

    const updatingTaskHead = req.body.taskHead;
    const query = {_id: updatingTaskHead._id};
    const options = updatingTaskHead;
    TaskHeadDBController.update(query, options, (err, result) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!result.n) {
            return res.sendStatus(400);
        } else {
            return res.status(200).send(updatingTaskHead);
        }
    });
};
