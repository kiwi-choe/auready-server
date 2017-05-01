const TaskHead = require(__appbase_dirname + '/models/task/taskhead');

const _create = (memberId, newTask, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskheadOfMemberAt) => {
        if (err) return done(err);
        if (!taskheadOfMemberAt) {
            return done(null, false);
        }
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
    TaskHead.findOne({'members.tasks.id': id}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('no taskhead');
            return done(null, false);
        }

        for (let i in taskhead.members) {
            const member = taskhead.members[i];
            for (let j in member.tasks) {
                if (member.tasks[j].id === id) {
                    // Remove a task of this taskhead
                    member.tasks.splice(j, 1);

                    taskhead.save((err, updated) => {
                        if (err) return done(err);
                        if (!updated) return done(null, false);
                        // Check the new tasks are saved
                        const updatedTasks = updated.members[i].tasks;
                        if (updatedTasks) {
                            return done(null, true);
                        }
                        return done(null, false);
                    });
                }
            }

        }
    });
};

/*
 * Update tasks of a taskHead
 * ; Clear the existing tasks of a taskHead and push new updating tasks
 * */
const _updateMulti = (taskHeadId, memberTasks, done) => {

    TaskHead.findOne({id: taskHeadId}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('no taskhead');
            return done(null, false);
        }

        memberTasks.forEach((memberTask, i) => {
            let updatingMemberIndex = taskhead.members.findIndex(member => {
                return member.id === memberTask.memberid;
            });
            if (updatingMemberIndex === -1) {
                console.log('no member with id ', memberTask.memberid);
                return done(null, false);
            }

            // Updating tasks
            const taskArr = taskhead.members[updatingMemberIndex].tasks;
            taskArr.length = 0;
            taskArr.push(...memberTask.tasks);

            if (i === memberTasks.length - 1) {
                taskhead.save((err, updatedTaskHead) => {
                    if (err) return done(err);
                    if (!updatedTaskHead) return done(null, false);
                    // Check the new tasks are saved
                    // forEach loop for TEST
                    updatedTaskHead.members.forEach((member, i) => {
                        console.log('\nmember.tasks - ', member.tasks);
                        if (i === updatedTaskHead.members.length - 1) {

                            return done(null, updatedTaskHead);
                        }
                    });
                });
            }
        });
    });
};

const _readById = (id, done) => {
    TaskHead.findOne({'members.task.id': id}, (err, taskHead) => {
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
    TaskHead.findOne({'members.tasks.id': {$in: ids}}, (err, taskhead) => {
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
                return task.id === deletingTaskId;
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

    TaskHead.findOne({id: id}, (err, taskHead) => {
        if (err) return done(err);
        if (!taskHead) {
            console.log('no taskhead');
            return done(null, false);
        }

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
    updateMulti: _updateMulti,
    readById: _readById,
    deleteMulti: _deleteMulti,
    deleteAll: _deleteAll
}