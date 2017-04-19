const TaskHead = require(__appbase_dirname + '/models/task/taskhead');

const _create = (taskHeadInfo, done) => {

    let newTaskHead = new TaskHead(taskHeadInfo);
    newTaskHead.modifiedTime = Date.now();
    newTaskHead.save(err => {
        if (err) {
            return done(err);
        }
        return done(null, newTaskHead);
    });
};

const _readById = (id, done) => {
    TaskHead.findOne({id: id}, (err, taskHead) => {
        if (err) throw  err;
        return done(null, taskHead);
    });
};

const _readByUserId = (userId, done) => {

    TaskHead.find({'members.userId': userId}, (err, taskheads) => {
        if (err) {
            return done(err);
        }
        if (taskheads.length === 0) {
            return done(null, false);
        }
        else {
            return done(null, taskheads);
        }
    });
};

const _updateTask = (task, done) => {
    TaskHead.findOne({'tasks.id': task.id}, (err, taskHead) => {
        // overwrite task
        taskHead.tasks[0] = task;
        taskHead.save((err, updatedTaskHead) => {
            if (err) return done(err);

            if (updatedTaskHead) {
                return done(false, updatedTaskHead);
            }
            return done(false, null);
        });
    });
};

const _deleteOne = (id, done) => {
    TaskHead.remove({id: id}, (err, removedCount) => {
        if (err) {
            return done(err);
        }
        if (removedCount.result.n === 0) {
            return done(null, false);
        }
        return done(null, true);
    });
};

const _deleteMulti = (ids, done) => {

    TaskHead.remove({id: {$in: ids}}, (err, removed) => {
        if (err) {
            console.log('err: ', err);
            return done(err);
        }
        if (removed.result.n !== ids.length) {
            return done(null, false);
        }
        return done(null, true);
    });
};

/*
 * Update details
 * ; title, color, members(only adding)
 * */
const addNewMembers = (addingMembers, done) => {

    // Duplication check to add new members
    let newMembers = [];
    for (let i = 0, len = addingMembers.length; i < len; i++) {
        let newMember = addingMembers[i];
        TaskHead.find({'members.id': newMember.id}, (err, members) => {
            if (err) {
                return done(err);
            }

            if (members.length === 0) {
                // push new member
                newMembers.push(newMember);
            }

            // Start to update
            if (i === addingMembers.length - 1) {

                if (newMembers.length === 0) {
                    console.log('there is no new member to add');
                    return done(null, false);
                }
                // Update
                TaskHead.update(
                    {id: taskHeadId},     // query
                    {                       // options
                        $push: {members: {$each: newMembers}},
                        $set: {
                            title: details.title,
                            color: details.color
                        }
                    }, (err, result) => {
                        if (err) {
                            return done(err);
                        }
                        return done(null, result);
                    });
            }   // end of updating
        }); // end of checking duplication
    }
};

const updateTaskHead = (taskHeadId, newMembers, details, done) => {

    let options;
    if (!newMembers) {
        options = {
            $set: {
                title: details.title,
                color: details.color
            }
        };
    } else {
        options = {
            $push: {members: {$each: newMembers}},
            $set: {
                title: details.title,
                color: details.color
            }
        };
    }

    TaskHead.update({id: taskHeadId}, options, (err, result) => {
        if (err) {
            return done(err);
        }
        return done(null, result);
    });
};

const _updateDetails = (taskHeadId, details, done) => {

    console.log('taskheadId', taskHeadId);
    console.log('details', details);

    const members = details.members;

    // 1. Check if this taskHead is exist
    TaskHead.findOne({id: taskHeadId}, (err, taskhead) => {
        if (err) {
            return done(err);
        }
        if (!taskhead) {
            console.log('taskhead is not exist');
            return done(null, false);
        }

        // 2. Push the new members
        // 2.1 If no member
        if (members.length === 0) {
            // Update
            updateTaskHead(taskHeadId, false, details, (err, result) => {
                if (err) {
                    return done(err);
                }
                return done(null, result);
            });
        }
        // 2.2 If there are adding members
        // 3. Duplication check to add new members
        let newMembers = [];
        for (let i = 0, len = members.length; i < len; i++) {
            let newMember = members[i];
            TaskHead.find({'members.id': newMember.id}, (err, taskheads) => {
                if (err) {
                    return done(err);
                }
                if (taskheads.length === 0) {
                    newMembers.push(newMember);
                }

                // Start to update
                if (i === members.length - 1) {

                    if (newMembers.length === 0) {
                        console.log('there is no new member to add');
                        updateTaskHead(taskHeadId, false, details, (err, result) => {
                            if (err) {
                                return done(err);
                            }
                            return done(null, result);
                        });
                    }

                    updateTaskHead(taskHeadId, newMembers, details, (err, result) => {
                        if (err) {
                            return done(err);
                        }
                        return done(null, result);
                    });
                }   // end of updating
            }); // end of checking duplication
        }

    }); //end of checking TaskHead is exist
};

const _deleteMember = (memberId, done) => {

    function findMembers(member) {
        return (member.id === memberId);
    }

    // find a taskhead including this member's id
    TaskHead.findOne({'members.id': memberId}, (err, taskhead) => {
        if (!taskhead) {
            console.log('couldn\'t find the taskhead');
            return done(null, false);
        }
        console.log(taskhead);

        // delete the member from member array
        let deletingIndex = taskhead.members.findIndex(findMembers);
        taskhead.members.splice(deletingIndex, 1);

        taskhead.save((err, updatedTaskHead) => {
            if (err) return done(err);

            if (updatedTaskHead) {
                return done(null, updatedTaskHead);
            }
            return done(null, false);
        });
    });
};

const _deleteAll = done => {
    TaskHead.remove({}, err => {
        if (err) {
            return done(err);
        }
        return done(null);
    });
};

module.exports = {
    create: _create,
    readById: _readById,
    readByUserId: _readByUserId,
    deleteOne: _deleteOne,
    deleteMulti: _deleteMulti,
    updateDetails: _updateDetails,
    deleteMember: _deleteMember,
    deleteAll: _deleteAll
}