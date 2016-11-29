const Task = require(__appbase_dirname + '/models/task');

const _create = (taskInfo, done) => {
    let newTask = new Task(taskInfo);
    newTask.createdTime = Date.now();
    newTask.save(err => {
        if(err) {
            return done(err);
        }
        return done(err, newTask);
    });
};

const _delete = (id, done) => {
    Task.remove({_id: id}, (err, removedCount) => {
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
    Task.update(query, options, (err, result) => {
        if(err) {
            return done(err);
        }
        return done(err, result);

    });
};

const _deleteAll = done => {
    Task.remove({}, err => {
        if (err) {
            return done(err);
        }
        return done(null);
    });
};

module.exports = {
    create: _create,
    delete: _delete,
    update: _update,
    deleteAll: _deleteAll
}