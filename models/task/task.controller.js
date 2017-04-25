const TaskHead = require(__appbase_dirname + '/models/task/taskhead');

const _create = (memberId, newTask, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskheadOfMemberAt) => {
        if (err) return done(err);
        if (!taskheadOfMemberAt) {
            return done(null, false);
        }
        console.log('taskheadOfMemberAt - ', taskheadOfMemberAt);
        let index = taskheadOfMemberAt.members.findIndex(member => {
            return member.id === memberId;
        });
        taskheadOfMemberAt.members[index].tasks.push(newTask);
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

const _update = (id, taskObj, done) => {
    TaskHead.findOne({'members.tasks._id': id}, (err, taskhead) => {
        if (err) {
            console.log(err);
            return done(err);
        }
        if (!taskhead) return done(null, false);

        // extract the updating task from tasks array
        const taskArr = taskhead.members[0].tasks;
        let updatingTaskIndex = taskArr.findIndex((task) => {
            return task._id.equals(id);
        });

        // Modify a task of this taskhead
        taskArr[updatingTaskIndex].description = taskObj.description;
        taskArr[updatingTaskIndex].completed = taskObj.completed;

        // Update taskhead
        // todo - set modifiedTime pre save
        taskhead.save((err, updatedTaskHead) => {
            if (err) return done(err);
            if (!updatedTaskHead) return done(null, false);
            // Check the new tasks are saved
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

    // find tasks including this task ids
    TaskHead.findOne({'members.tasks._id': {$in: ids}}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('couldn\'t find the taskhead');
            return done(null, false);
        }

        // found taskhead's member is only one coz task's id is unique - taskhead.member.length: 1
        // delete tasks from task array
        const taskArr = taskhead.members[0].tasks;
        ids.forEach((deletingTaskId, i) => {
            let deletingIndex = taskArr.findIndex((task) => {
                return task._id.equals(deletingTaskId);
            });
            let deletedTask = taskArr.splice(deletingIndex, 1);
            console.log('\ndeletedTask - ', deletedTask);

            if (ids.length - 1 === i) {
                // Update taskhead
                taskhead.save((err, updatedTaskHead) => {
                    if (err) {
                        return done(err);
                    }
                    if (updatedTaskHead) {
                        console.log('\nupdatedTaskHead.member[0].tasks - ', updatedTaskHead.members[0].tasks);
                        return done(null, updatedTaskHead);
                    }
                    return done(null, false);
                });
            }
        });
    });
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