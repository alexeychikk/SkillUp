
module.exports = function(knex, userHasSkills){
    function callback (exp, req, res, next) {
        //Вставляем новое задание
        knex('tasks').returning('id').insert({
            title: req.body.title,
            description: req.body.description,
            exp: exp,
            author: req.user.id,
            links: req.body.links
        }).then(function (taskID) {
            taskID = taskID[0]; //Вставим скиллы для нового задания
            for (var i in req.body.skills) req.body.skills[i].task_id = taskID;
            knex('task_skills').insert(req.body.skills).then(function() {
                //добавим запись автору в таблице tasks_meta с колонкой created = true
                knex('tasks_meta').insert({task_id: taskID, user_id: req.user.id, created: true}).then(function() {
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
    }

    return function (req, res, next) {
        if (req.isAuthenticated()) {
            //Рассчитываем экспу для задания
            var exp = 0;
            for (var i in req.body.skills) {
                exp += GLOBAL.exs.skills[req.body.skills[i].skill_id].exp;
            }
            //Проверяем, хватает ли у автора експы на случай некорректности задания
            if (req.user.exp < exp * GLOBAL.INCORRECT_TASK_EXP_MULTIPLIER) res.end();
            else knex('user_skills').where('user_id', '=', req.user.id).select('skill_id', 'count')
                .then(function(userSkills) {
                    if (!userHasSkills(userSkills, req.body.skills)) {
                        res.end();
                    }
                    else callback(exp, req, res, next);
                }).catch(function (error) {
                    console.log(error);
                    res.end();
                });
        } else res.end();
    };
};