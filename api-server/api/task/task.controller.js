const TaskDBController = require(__appbase_dirname + '/models/task/task.controller');
const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');
const TaskHead = require(__appbase_dirname + '/models/task/taskhead');

exports.create = (req, res) => {

    const memberId = req.params.memberid;
    if(!memberId) {
        console.log('memberId is ' + memberId);
        return res.sendStatus(400);
    }
    const taskInfo = {
        id: req.body.id,
        description: req.body.description,
        completed: req.body.completed,
        order: req.body.order
    };
    TaskDBController.create(memberId, taskInfo, (err, createdTask) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(createdTask) {
            console.log(createdTask);
            return res.sendStatus(201);
        }
        return res.sendStatus(400);
    });
};

exports.deleteMulti = (req, res) => {

    let deletingTaskIds = req.body.ids;
    if(!deletingTaskIds) {
        return res.sendStatus(400);
    }

    TaskDBController.deleteMulti(deletingTaskIds, (err, isRemoved) => {
        if (err) {
            return res.sendStatus(401);
        }
        if (!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
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

    const memberId = req.params.memberid;
    if(!memberId) {
        console.log('memberId is ' + memberId);
        return res.sendStatus(400);
    }
    TaskDBController.update(memberId, req.body, (err, updatedTaskHead) => {
        if(err) {
            console.log(err);
            return res.sendStatus(404);
        }
        if(!updatedTaskHead) {
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};