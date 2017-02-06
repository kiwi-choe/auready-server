const TaskHead = require(__appbase_dirname + '/models/task/taskhead');

const _create = (memberId, newTask, done) => {
    TaskHead.findOne({'members._id': memberId},
        (err, taskheadOfMemberAt) => {
            if (err) return done(err);
            if (!taskheadOfMemberAt) {
                return done(null, false);
            }
            taskheadOfMemberAt.members[0].tasks.push(newTask);
            taskheadOfMemberAt.save((err, updatedTaskHeadOfMember) => {
                if (err) return done(err);

                const tasksByMemberId = updatedTaskHeadOfMember.members[0].tasks;
                if (tasksByMemberId) {
                    const createdTask =
                        tasksByMemberId[tasksByMemberId.length - 1];
                    return done(null, createdTask);
                }
                return done(null, false);
            });
        });
};

const _delete = (id, done) => {
    TaskHead.findOne({'members.tasks._id': id}, (err, taskHead) => {
        if (err) return done(err);
        if (!taskHead) return done(null, false);

        // Remove a task of this taskhead
        taskHead.members[0].tasks[0].length = 0;
        // Update this taskHead
        taskHead.save((err, updatedTaskHead) => {
            if (err) return done(err);
            if (!updatedTaskHead) return done(null, false);
            return done(null, true);
        });
    });
};

const _update = (query, options, done) => {

    TaskHead.findOne(query, (err, taskHead) => {
        if (err) return done(err);
        if (!taskHead) return done(null, false);

        // Modify a task of this taskhead
        taskHead.members[0].tasks[0] = options;
        // Update this taskHead
        taskHead.save((err, updatedTaskHead) => {
            if (err) return done(err);
            if (!updatedTaskHead) return done(null, false);
            const updatedTasks = updatedTaskHead.members[0].tasks;
            if (updatedTasks) {
                return done(null, updatedTaskHead);
            }
            return done(null, false);
        });
    });
};

const _readById = (id, done) => {
    TaskHead.findOne({'members.task._id': id}, (err, taskHead) => {
        if (err) return done(err);
        if (!taskHead) return done(null, false);
        if (taskHead.members[0]) {
            if (taskHead.members[0].tasks[0]) {

            }
        }
        const taskByTaskId = taskHead.members[0].tasks[0];
        if (!taskByTaskId) return done(null, false);
    });
};

const _deleteMulti = (ids, done) => {
    return done(null, false);
};

// Delete all tasks of the taskhead
const _deleteAll = (id, done) => {

    TaskHead.findOne({_id: id}, (err, taskHead) => {
        if (err) return done(err);
        if (!taskHead) return done(null, false);

        // Remove tasks of this taskHead
        const len = taskHead.members.length;
        for (let i = 0; i < len; i++) {
            // remove tasks of members[i]
            taskHead.members[i].tasks.length = 0;
        }
        // Update this taskHead
        taskHead.save((err, updatedTaskHead) => {
            if (err) return done(err);
            if (!updatedTaskHead) return done(null, false);
            return done(null, true);
        });
    });
};

module.exports = {
    create: _create,
    delete: _delete,
    update: _update,
    readById: _readById,
    deleteMulti: _deleteMulti,
    deleteAll: _deleteAll
}