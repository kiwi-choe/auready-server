const TaskDBController = require(__appbase_dirname + '/models/task/task.controller');
const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');
const TaskHead = require(__appbase_dirname + '/models/task/taskhead');

exports.create = (req, res) => {

    TaskDBController.create(req.body.memberid, req.body.task, (err, createdTask) => {
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

    // TaskHeadDBController.updateTask(req.body.task, (err, updatedTaskHead) => {
    //     if(err) {
    //         return res.sendStatus(400);
    //     }
    //     if(updatedTaskHead) {
    //         console.log(updatedTaskHead);
    //         console.log(updatedTaskHead.tasks[0].completed);
    //         return res.sendStatus(200);
    //     }
    //     return res.sendStatus(400);
    // });
};