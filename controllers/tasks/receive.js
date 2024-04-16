
module.exports = function(knex) {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            knex('tasks_meta').where('task_id', req.body.task_id).andWhere('user_id', req.user.id)
                .select('received').then(function(rows) {
                    var meta_exists = rows.length > 0;
                    var received = meta_exists && rows[0].received;
                    var value = {received: !received};

                    var query = knex('tasks_meta');
                    if (meta_exists) query.update(value).where('task_id', req.body.task_id).andWhere('user_id', req.user.id);
                    else {
                        value.task_id = req.body.task_id;
                        value.user_id = req.user.id;
                        query.insert(value);
                    }
                    query.then(function() {
                        knex('tasks').where('id', req.body.task_id).increment('participants', received ? -1 : 1).then(function () {
                            res.end('ok');
                        }).catch(function (error) {
                            console.log(error);
                            res.end();
                        });
                    }).catch(function (error) {
                        console.log(error);
                        res.end();
                    });
                }).catch(function (error) {
                    console.log(error);
                    res.end();
                });
        } else res.end();
    };
};