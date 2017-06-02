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

/*
 * Update tasks of a taskHead
 * ; Updating description only
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

            // for only editing description and order, validate that the task exists
            for (let task of memberTask.tasks) {
                const indexOfUpdatingTask = taskArr.findIndex(updatingTask => {
                    return updatingTask.id === task.id;
                });
                if (indexOfUpdatingTask !== -1) {
                    // overwrite the task
                    taskArr[indexOfUpdatingTask].description = task.description;
                }
            }

            if (i === memberTasks.length - 1) {
                taskhead.save((err, updatedTaskHead) => {
                    if (err) return done(err);
                    if (!updatedTaskHead) return done(null, false);
                    return done(null, updatedTaskHead);
                });
            }
        });
    });
};

/*
 * comparing tasks
 * if the task exists, update
 * */
const _updateOfMember = (memberId, updatingTasks, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('There is no taskhead of ', memberId);
            return done(null, false, 204);
        }

        let updatingMemberIndex = taskhead.members.findIndex(member => {
            return member.id === memberId;
        });

        const taskArr = taskhead.members[updatingMemberIndex].tasks;
        if (taskArr.length === 0) {
            console.log('returns just 0, and done');
            return done(null, taskArr);
        }
        // Start to edit
        const NOT_FOUND = -1;
        updatingTasks.forEach((updatingTask, i) => {
            // if taskArr do not contains paramsTasks,
            const indexOfTask = taskArr.findIndex(task => {
                return task.id === updatingTask.id;
            });
            if (indexOfTask !== NOT_FOUND) {
                // overwrite the task into the index
                taskArr[indexOfTask] = updatingTask;
            } else {
                console.log('wrong task id of updatingTasks - ', updatingTask.id);
            }

            if (i === updatingTasks.length - 1) {
                taskhead.save((err, updated) => {
                    if (err) return done(err);
                    if (!updated) {
                        return done(null, false);
                    }
                    return done(null, updated.members[updatingMemberIndex].tasks);
                });
            }
        });
    });
};

const _addTask = (memberId, newTask, updatingTasks, done) => {

    TaskHead.findOne({'members.id': memberId}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('There is no taskhead of ', memberId);
            return done(null, false, 204);
        }

        let updatingMemberIndex = taskhead.members.findIndex(member => {
            return member.id === memberId;
        });
        const taskArr = taskhead.members[updatingMemberIndex].tasks;

        const ADD = () => {
            taskArr.push(newTask);
            taskhead.save((err, updated) => {
                if (err) return done(err);
                if (!updated) {
                    return done(null, false);
                }
                console.log(updated.members[updatingMemberIndex].tasks);
                return done(null, updated.members[updatingMemberIndex].tasks);
            });
        };

        if(updatingTasks.length === 0) {
            console.log('only add');
            ADD();
        }
        // Add and Edit
        const NOT_FOUND = -1;
        updatingTasks.forEach((updatingTask, i) => {
            // if taskArr do not contains paramsTasks,
            const indexOfTask = taskArr.findIndex(task => {
                return task.id === updatingTask.id;
            });
            if (indexOfTask !== NOT_FOUND) {
                // overwrite the task into the index
                taskArr[indexOfTask] = updatingTask;
            } else {
                console.log('wrong task id of updatingTasks - ', updatingTask.id);
            }

            if (i === updatingTasks.length - 1) {
                ADD();
            }
        });

    });
};

const _deleteTask = (memberId, taskId, updatingTasks, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('There is no taskhead of ', memberId);
            return done(null, false, 204);
        }

        let updatingMemberIndex = taskhead.members.findIndex(member => {
            return member.id === memberId;
        });
        const taskArr = taskhead.members[updatingMemberIndex].tasks;

        const DEL = () => {
            const indexOfDeletingTask = taskArr.findIndex(task => {
                return task.id === taskId;
            });
            taskArr.splice(indexOfDeletingTask, 1);
            taskhead.save((err, updated) => {
                if (err) return done(err);
                if (!updated) {
                    return done(null, false);
                }
                console.log(updated.members[updatingMemberIndex].tasks);
                return done(null, updated.members[updatingMemberIndex].tasks);
            });
        };

        if (taskArr.length === 0) {
            console.log('no tasks to delete and edit');
            return done(null, false);
        }

        if(updatingTasks.length === 0) {
            console.log('only del');
            DEL();
        }
        // Del and Edit
        const NOT_FOUND = -1;
        updatingTasks.forEach((updatingTask, i) => {
            // if taskArr do not contains paramsTasks,
            const indexOfTask = taskArr.findIndex(task => {
                return task.id === updatingTask.id;
            });
            if (indexOfTask !== NOT_FOUND) {
                // overwrite the task into the index
                taskArr[indexOfTask] = updatingTask;
            } else {
                console.log('wrong task id of updatingTasks - ', updatingTask.id);
            }

            if (i === updatingTasks.length - 1) {
                DEL();
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

const _readByMemberId = (memberId, done) => {
    TaskHead.findOne({'members.id': memberId}, (err, taskHead) => {
        if (err) return done(err);
        if (!taskHead) {
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
    updateOfTaskHead: _updateOfTaskHead,
    updateOfMember: _updateOfMember,
    addTask: _addTask,
    deleteTask: _deleteTask,
    readByMemberId: _readByMemberId,
    deleteAll: _deleteAll
}