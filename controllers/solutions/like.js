
module.exports = function(knex) {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            knex('solutions').where('id', req.body.solution_id).select('user_id as author')
                .leftJoin('solutions_meta as sm', {'solutions.id': 'sm.solution_id', 'tm.user_id': parseInt(req.user.id)})
                .select('liked').then(function(rows) {
                    var meta_exists = rows.length > 0;
                    var liked = meta_exists && rows[0].liked;
                    var value = {liked: !liked};

                    var query = knex('solutions_meta');
                    if (meta_exists) query.update(value).where('solution_id', req.body.solution_id).andWhere('user_id', req.user.id);
                    else {
                        value.solution_id = req.body.solution_id;
                        value.user_id = req.user.id;
                        query.insert(value);
                    }
                    query.then(function() {
                        knex('solutions').where('id', req.body.solution_id).increment('likes', liked ? -1 : 1).then(function () {
                            res.end('ok');
                            //Удалим или добавим уведомление
                            if (req.user.id == rows[0].author) return;
                            if (liked) {
                                knex('notifications').where('type', 'solution_liked').andWhere('other_user_id', req.user.id)
                                    .andWhere('task_id', req.body.task_id).del().then(function(){});
                            }
                            else {
                                knex('notifications').insert({
                                    user_id: rows[0].author,
                                    type: 'solution_liked',
                                    task_id: req.body.task_id,
                                    other_user_id: req.user.id}).then(function(){});
                            }
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