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
const _updateOfTaskHead = (taskHeadId, memberTasks, done) => {

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
            Array.prototype.push.apply(taskArr, memberTask.tasks);

            if (i === memberTasks.length - 1) {
                taskhead.save((err, updatedTaskHead) => {
                    if (err) return done(err);
                    if (!updatedTaskHead) return done(null, false);
                    console.log('updatedTaskHead - ', updatedTaskHead);
                    return done(null, updatedTaskHead);
                });
            }
        });
    });
};

const _updateOfMember = (memberId, updatingTasks, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskhead) => {
        if(err) {
            return done(err);
        }
        if(!taskhead) {
            console.log('There is no taskhead of ', memberId);
            return done(null, false, 204);
        }

        let updatingMemberIndex = taskhead.members.findIndex(member => {
            return member.id === memberId;
        });
        const taskArr = taskhead.members[updatingMemberIndex].tasks;
        // Init
        taskArr.length = 0;
        Array.prototype.push.apply(taskArr, updatingTasks);

        taskhead.save((err, updated) => {
            if(err) return done(err);
            if(!updated) {
                return done(null, false);
            }
            return done(null, updated);
        });
    });
};

const _changeCompleted = (taskId, taskInfo, done) => {

    TaskHead.findOne({'members.tasks.id': taskId}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('called with wrong id');
            return done(null, false);
        }

        for (let i in taskhead.members) {
            const member = taskhead.members[i];
            for (let j in member.tasks) {
                if (member.tasks[j].id === taskId) {
                    // Update a task of this taskhead
                    member.tasks[j].description = taskInfo.description;
                    member.tasks[j].completed = taskInfo.completed;
                    member.tasks[j].order = taskInfo.order;

                    taskhead.save((err, updated) => {
                        if (err) return done(err);
                        if (!updated) return done(null, false);
                        // Check the new tasks are saved
                        const updatedTasks = updated.members[i].tasks;
                        if (updatedTasks) {
                            console.log('updatedTasks - ', updatedTasks);
                            return done(null, true);
                        }
                        return done(null, false);
                    });
                }
            }

        }
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

const _readByMemberId = (memberId, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskHead) => {
        if(err) return done(err);
        if(!taskHead) {
            console.log('no taskhead');
            return done(null, false);
        }
        let foundMemberIndex = taskHead.members.findIndex(member => {
            return member.id === memberId;
        });
        const taskArr = taskHead.members[foundMemberIndex].tasks;
        return done(null, taskArr);
    });
};

module.exports = {
    create: _create,
    delete: _delete,
    updateOfTaskHead: _updateOfTaskHead,
    updateOfMember: _updateOfMember,
    changeCompleted: _changeCompleted,
    readByMemberId: _readByMemberId,
    deleteAll: _deleteAll
}