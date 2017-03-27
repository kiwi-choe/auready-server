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
    TaskHead.findById(id, (err, taskHead) => {
        if (err) throw  err;
        return done(null, taskHead);
    });
};

const _readByMemberName = (name, done) => {

    TaskHead.find({'members.name': name}, (err, taskheads) => {
        if(err) {
            return done(err);
        }
        if(taskheads.length === 0) {
            return done(null, false);
        }
        else {
            return done(null, taskheads);
        }
    });
};

const _updateTask = (task, done) => {
    TaskHead.findOne({'tasks._id': task._id}, (err, taskHead) => {
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

    TaskHead.remove({_id: {$in: ids}}, (err, removed) => {
        if(err) {
            console.log('err: ', err);
            return done(err);
        }
        if(removed.result.n !== ids.length) {
            return done(null, false);
        }
        return done(null, true);
    });
};

// Update details - current details are 'title', 'members'
const _updateDetails = (taskHeadId, details, done) => {

    console.log('taskheadId', taskHeadId);
    console.log('details', details);

    const title = details.title;
    const members = details.members;

    // Duplication check to add new members
    let newMembers = [];
    members.forEach((member, i) => {

        // There is no member with newMember.name
        TaskHead.find({
            _id: taskHeadId,
            'members.name': member.name
        }, (err, taskhead) => {
            if(err) {
                return done(err);
            }
            if (!taskhead) {
                return done(null, false);
            }

            if (taskhead.length === 0) {
                // push new member
                newMembers.push(member);
            }

            // Start to update
            if (i === members.length - 1) {

                console.log('newMembers ', newMembers);
                if (newMembers.length === 0) {
                    console.log('there is no new member to add');
                    return done(null, false);
                }
                // Update
                TaskHead.update(
                    {_id: taskHeadId},     // query
                    {                       // options
                        $push: {members: {$each: newMembers}},
                        $set: {title: title}
                    }, (err, result) => {
                        if (err) {
                            return done(err);
                        }
                        return done(null, result);
                    });
            }   // end of updating
        }); // end of checking duplication

    });
};

const _deleteMember = (memberId, done) => {

    function findMembers(member) {
        return member._id.equals(memberId);
    }
    // find a taskhead including this member's id
    TaskHead.findOne({'members._id': memberId}, (err, taskhead) => {
        if(!taskhead) {
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
    readByMemberName: _readByMemberName,
    deleteOne: _deleteOne,
    deleteMulti: _deleteMulti,
    updateDetails: _updateDetails,
    deleteMember: _deleteMember,
    deleteAll: _deleteAll
}