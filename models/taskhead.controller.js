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

const _delete = (id, done) => {
    TaskHead.remove({_id: id}, (err, removedCount) => {
        if(err) {
            return done(err);
        }
        if(removedCount.result.n === 0) {
            return done(null, false);
        }
        return done(null, true);
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
    delete: _delete,
    deleteAll: _deleteAll
}