const TaskHead = require(__appbase_dirname + '/models/taskhead');

const _create = (taskHeadInfo, done) => {

    let newTaskHead = new TaskHead({
        title: taskHeadInfo.title,
        members: taskHeadInfo.members,
        order: taskHeadInfo.order
    });
    newTaskHead.createdTime = Date.now();
    newTaskHead.save(err => {
        if(err) {
            return done(err);
        }
        return done(err, newTaskHead);
    });
};

const _createTask = (id, taskInfo, done) => {

    TaskHead.findById(id, (err, taskHead) => {
        taskHead.tasks.push(taskInfo);
        taskHead.save((err, updatedTaskHead) => {
            if(err) return done(err);

            if(updatedTaskHead) {
                return done(false, updatedTaskHead);
            }
            return done(false, null);
        });
    });
};

const _updateTask = (task, done) => {
    TaskHead.findOne({'tasks._id': task._id}, (err, taskHead) => {
        // overwrite task
        taskHead.tasks[0] = task;
        taskHead.save((err, updatedTaskHead) => {
            if(err) return done(err);

            if(updatedTaskHead) {
                return done(false, updatedTaskHead);
            }
            return done(false, null);
        });
    });
};

const _delete = (id, done) => {
    TaskHead.remove({_id: id}, (err, removedCount) => {
        if (err) {
            return done(err);
        }
        if (removedCount.result.n === 0) {
            return done(null, false);
        }
        return done(null, true);
    });
};

const _update = (query, options, done) => {

    TaskHead.update(query, options, (err, result) => {
        if(err) {
            return done(err);
        }
        return done(err, result);

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
    createTask: _createTask,
    delete: _delete,
    update: _update,
    updateTask: _updateTask,
    deleteAll: _deleteAll
}