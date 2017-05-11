const TaskHeadDBController = require(__appbase_dirname + '/models/task/taskhead.controller');
const NotificationController = require(__appbase_dirname + '/api-server/api/notification/notification.controller');

exports.create = (req, res) => {

    const taskHeadInfo = {
        id: req.body.id,
        title: req.body.title,
        color: req.body.color,
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

    const details = {
        id: req.body.id,
        title: req.body.title,
        color: req.body.color,
        members: req.body.members
    };
    TaskHeadDBController.updateDetails(req.params.id, details, (err, result) => {
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

const SendNotifications = (fromUser, updatedTaskHeads) => {
    console.log('entered into sendNotifications');

    updatedTaskHeads.forEach((updatedTaskHead, i) => {
        const toUserIds = [];
        for (let member of updatedTaskHead.members) {
            toUserIds.push(member.userId);
        }
        const taskHeadTitle = updatedTaskHead.title;
        NotificationController.exitTaskHead(toUserIds, fromUser, taskHeadTitle, (success) => {
            if (!success) {
                console.log('send notifications to fcm server is failed');
            }

            if (updatedTaskHeads.length - 1 === i) {
                console.log('success to send all notifications');
            }
        });
    });
};

exports.deleteMulti = (req, res) => {

    let deletingTaskHeadIds = req.body.ids;
    if (!deletingTaskHeadIds) {
        return res.sendStatus(400);
    }
    const fromUser = {
        id: req.user.id,
        name: req.user.name
    };
    TaskHeadDBController.deleteMulti(req.user.id, deletingTaskHeadIds, (err, updatedTaskHeads) => {
        if (err) {
            return res.sendStatus(401);
        }
        if (!updatedTaskHeads) {
            return res.sendStatus(400);
        }
        // updated arr length is 0, returns only 200 status code
        if (updatedTaskHeads.length === 0) {
            return res.sendStatus(200);
        }
        // else, Send notifications to other members and returns response
        console.log('..............');
        SendNotifications(fromUser, updatedTaskHeads);
        return res.sendStatus(200);
    });
};

// Delete a member - it's updating taskhead
exports.deleteMember = (req, res) => {

    let memberId = req.params.id;
    TaskHeadDBController.deleteMember(memberId, (err, updatedTaskHead) => {

        if (err) {
            return res.sendStatus(401);
        }

        if (!updatedTaskHead) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200);
        }
    });
};

// Get taskHeads of the member
exports.getTaskHeads = (req, res) => {

    console.log('entered into getTaskHeads - member');
    TaskHeadDBController.readByUserId(req.params.userid, (err, taskheads) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!taskheads) {
            console.log('\nno taskheads');
            return res.sendStatus(204);
        }
        else {
            console.log('taskheads - ', taskheads);
            return res.status(200).json(taskheads);
        }
    });
};

// Get a taskHead by id
exports.getTaskHead = (req, res) => {

    console.log('entered into getTaskHead');
    const taskheadId = req.query.id;
    if(!taskheadId) {
        console.log('query id is ', taskheadId);
        return res.sendStatus(404);
    }
    TaskHeadDBController.readById(taskheadId, (err, taskhead) => {
        if (err) {
            return res.sendStatus(400);
        }
        if (!taskhead) {
            console.log('\nno taskhead');
            return res.sendStatus(204);
        }
        else {
            console.log('taskhead - ', taskhead);
            return res.status(200).json(taskhead);
        }
    });
};