
module.exports = function(knex) {
    return function (req, res, next) {
        if (req.isAuthenticated()) { //Возьмем задание и метаданные для решающего
            knex('tasks').where('id', '=', req.body.task_id).select('exp', 'is_approved', 'done', 'created',
                knex.raw('task_id IS NOT NULL as meta_exists'))
                .leftJoin('tasks_meta as tm', {'tasks.id': 'tm.task_id', 'tm.user_id': req.user.id}).then(function(task) {
                    task = task[0];
                    //Нельзя решить неподтвержденное или подтвержденное некорректное, решенное тобой или созданное тобой задание
                    if (!task.is_approved || task.done || task.created || req.user.exp < task.exp) {
                        res.end();
                    }
                    else knex('solutions').insert({ //Добавляем решение в бд
                        task_id: req.body.task_id,
                        user_id: req.user.id,
                        content: req.body.content
                    }).then(function () {
                        var query = knex('tasks_meta'); //Для решающего запишем в tasks_meta.done значение true,
                        var meta = {done: true, received: false}; //а в task_meta.received значение false
                        //Если запись для текущего проверяющего есть - update
                        if (task.meta_exists) query.update(meta).where('task_id', req.body.task_id).andWhere('user_id', req.user.id);
                        else { //иначе - insert
                            meta.task_id = req.body.task_id;
                            meta.user_id = req.user.id;
                            query.insert(meta);
                        }
                        query.then(function() { //Снимем экспу за решение задания
                            knex('users').where('id', req.user.id).decrement('exp', task.exp).then(function() {
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
            }).catch(function (error) {
                console.log(error);
                res.end();
            });
        }
        else res.end();
    };
};