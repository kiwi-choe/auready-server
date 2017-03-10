const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');

exports.create = (req, res) => {

    const taskHeadInfo = {
        id: req.body.id,
        title: req.body.title,
        members: req.body.members
    };
    TaskHeadDBController.create(taskHeadInfo, (err, newTaskHead) => {
        if (err) {
            return res.sendStatus(400);
        }
        return res.sendStatus(201);
    });
};

exports.deleteOne = (req, res) => {
    TaskHeadDBController.deleteOne(req.params.id, (err, isRemoved) => {
        if (err) {
            return res.sendStatus(404);
        }
        if (!isRemoved) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.updateDetails = (req, res) => {

    TaskHeadDBController.updateDetails(req.params.id, req.body.details, (err, result) => {
        if (err) {
            return res.sendStatus(404);
        }
        if (!result) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

exports.deleteMulti = (req, res) => {

    let deletingTaskHeadIds = req.body.ids;
    if (!deletingTaskHeadIds) {
        return res.sendStatus(400);
    }

    TaskHeadDBController.deleteMulti(deletingTaskHeadIds, (err, isRemoved) => {
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

// Delete a member - it's updating taskhead
exports.deleteMember = (req, res) => {

    let memberId = req.params.id;
    TaskHeadDBController.deleteMember(memberId, (err, result) => {

        if (err) {
            return res.sendStatus(401);
        }
        if (!result) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

// Get taskHeads of the member
exports.getTaskHeads = (req, res) => {

    TaskHeadDBController.readByMemberName(req.params.name, (err, taskheads) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!taskheads) {
            return res.sendStatus(404);
        }
        else {
            console.log('taskheads - ', taskheads);
            console.log('taskheads.members - ', taskheads[0].members);
            return res.status(200).json({
                taskheads: taskheads
            });
        }
    });
};