const TaskDBController = require(__appbase_dirname + '/models/task/task.controller');

exports.create = (req, res) => {

    console.log('entered into create');
    const memberId = req.params.memberid;
    const taskInfo = {
        id: req.body.id,
        description: req.body.description,
        completed: req.body.completed,
        order: req.body.order
    };
    TaskDBController.create(memberId, taskInfo, (err, createdTask) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (createdTask) {
            console.log('createdTask - ', createdTask);
            return res.sendStatus(201);
        }
        return res.sendStatus(400);
    });
};

exports.updateOfTaskHead = (req, res) => {
    console.log('\nentered into update tasks');

    const taskheadId = req.params.id;
    const tasks = req.body;
    TaskDBController.updateOfTaskHead(taskheadId, tasks, (err, updatedTaskHead) => {
        if (err) {
            console.log(err);
            return res.sendStatus(404);
        }
        if (!updatedTaskHead) {
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};

exports.updateOfMember = (req, res) => {
    console.log('\nentered into updateOfMember');

    const memberId = req.params.id;
    if (!memberId) {
        console.log('params memberId is ', memberId);
        return res.sendStatus(404);
    }

    TaskDBController.updateOfMember(memberId, req.body, (err, updated, noMemberErr) => {
        if (err) {
            console.log('err - ', err);
            return res.sendStatus(400);
        }
        if (!updated) {
            if (noMemberErr === 204) {
                return res.sendStatus(204);
            }
            console.log('updated fail');
            return res.sendStatus(400);
        }
        return res.status(200).json(updated);
    });
};

exports.addTask = (req, res) => {
    console.log('entered into addTask');

    const memberId = req.params.id;
    TaskDBController.addTask(memberId, req.body.newTask, req.body.editingTasks, (err, updated, noMemberErr) => {
        if (err) {
            console.log('err - ', err);
            return res.sendStatus(400);
        }
        if (!updated) {
            if (noMemberErr === 204) {
                return res.sendStatus(204);
            }
            console.log('updated fail');
            return res.sendStatus(400);
        }
        return res.status(200).json(updated);
    });
};

exports.deleteTask = (req, res) => {
    console.log('entered into deleteTask');

    const memberId = req.params.memberid;
    const taskHeadId = req.params.id;
    TaskDBController.deleteTask(memberId, taskHeadId, req.body, (err, updated, noMemberErr) => {
        if (err) {
            console.log('err - ', err);
            return res.sendStatus(400);
        }
        if (!updated) {
            if (noMemberErr === 204) {
                return res.sendStatus(204);
            }
            console.log('updated fail');
            return res.sendStatus(400);
        }
        return res.status(200).json(updated);
    });
};

exports.changeCompleted = (req, res) => {
    console.log('entered into changeCompleted');

    TaskDBController.changeCompleted(req.params.memberid, req.params.id, req.body, (err, updated, noMemberErr) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!updated) {
            if(noMemberErr === 204) {
                return res.sendStatus(204);
            }
            return res.sendStatus(400);
        }
        return res.status(200).json(updated);
    });
};

exports.changeOrders = (req, res) => {
    console.log('entered into changeOrders');

    TaskDBController.changeOrders(req.params.id, req.body, (err, updated, noMemberErr) => {
        if(err) {
            return res.sendStatus(400);
        }
        if(!updated) {
            if(noMemberErr === 204) {
                return res.sendStatus(204);
            }
            return res.sendStatus(400);
        }
        return res.status(200).json(updated);
    });
};

exports.getTasksOfMember = (req, res) => {
    console.log('entered into getTasksOfMember');
    const memberId = req.params.memberid;
    TaskDBController.readByMemberId(memberId, (err, tasks) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!tasks) {
            console.log('no tasks');
            return res.sendStatus(204);
        }
        return res.status(200).json(tasks);
    });
};