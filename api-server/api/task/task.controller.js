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

    console.log('entered into delete');
    TaskDBController.delete(req.params.id, (err, isRemoved) => {
        if(err) {
            return res.sendStatus(404);
        }
        if(!isRemoved) {
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};


exports.updateOfTaskHead = (req, res) => {
    console.log('\nentered into update tasks');

    const taskheadId = req.params.taskheadid;
    if(!taskheadId) {
        console.log('req params taskheadid is ', taskheadId);
        return res.sendStatus(400);
    }

    const tasks = req.body;
    TaskDBController.updateOfTaskHead(taskheadId, tasks, (err, updatedTaskHead) => {
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

exports.updateOfMember = (req, res) => {
    console.log(req.query);
    console.log('\nentered into updateOfMember');

    const memberId = req.query.memberid;
    if(!memberId) {
        console.log('query memberId is ', memberId);
        return res.sendStatus(404);
    }

    TaskDBController.updateOfMember(memberId, req.body, (err, updated, noMemberErr) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!updated) {
            if(noMemberErr === 204) {
                return res.sendStatus(204);
            }
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};

exports.getTasksOfMember = (req, res) => {
    console.log('entered into getTasksOfMember');
    const memberId = req.params.memberid;
    TaskDBController.readByMemberId(memberId, (err, tasks) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!tasks) {
            console.log('no tasks');
            return res.sendStatus(204);
        }
        return res.status(200).json(tasks);
    });
};