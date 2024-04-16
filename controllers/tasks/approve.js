
module.exports = function (knex, userHasSkills) {
    function callback(task, req, res, next) {
        req.body.user_id = req.user.id; //Вставим результаты текущего подтверждающего
        knex('approvements').insert(req.body).returning('id').then(function (appr_id) {
            appr_id = appr_id[0].id;
            var query = knex('tasks_meta'); //Запишем в tasks_meta.approved значение true для подтверждающего
            var meta = {approved: true};
            //Если запись для текущего проверяющего есть - update
            if (task.meta_exists) query.update(meta).where('task_id', req.body.task_id).andWhere('user_id', req.user.id);
            else { //иначе - insert
                meta.task_id = req.body.task_id;
                meta.user_id = req.user.id;
                query.insert(meta);
            }
            query.then(function () {
                res.end('ok');
                //Уведомление автору задания
                knex('notifications').insert({
                    user_id: task.author,
                    type: 'your_task_approved',
                    approvement_id: appr_id,
                    task_id: req.body.task_id,
                    other_user_id: req.user.id}).then(function(){});
                //TODO: Уведомление sub_task_approved друзьям подтвердившего (системы подписок пока что нет)

                //Для того чтобы проверить, можно ли вынести новому заданию приговор - вытащим для него все approvements
                knex('approvements').where('task_id', req.body.task_id).then(function(approvers) {
                    var count = approvers.length;

                    //Уведомления остальным подтвердившим
                    if (count) {
                        for (var i in approvers) {
                            if (approvers[i].user_id != req.user.id) { //кроме только что подтвердившего
                                knex('notifications').insert({
                                    user_id: approvers[i].user_id,
                                    type: 'task_approved',
                                    approvement_id: appr_id,
                                    task_id: req.body.task_id,
                                    other_user_id: req.user.id
                                }).then(function () {});
                            }
                        }
                    }

                    //Если количество подвердивших достаточное - начинаем процесс подтверждения
                    if (count == GLOBAL.COUNT_TO_APPROVE) {
                        var tc = 0, tic = 0, sc = 0, sic = 0, dc = 0, dic = 0, lc = 0, lic = 0;

                        for (var i in approvers) {
                            if (approvers[i].title_correct) tc++;
                            else tic++;
                            if (approvers[i].skills_correct) sc++;
                            else sic++;
                            if (approvers[i].desc_correct) dc++;
                            else dic++;
                            if (approvers[i].links_correct) lc++;
                            else lic++;
                        }

                        //Проверим задание на корректность по каждому из критериев
                        var titleCorrect = tc / count >= GLOBAL.CORRECT_CONSTANT;
                        var skillsCorrect = sc / count >= GLOBAL.CORRECT_CONSTANT;
                        var descCorrect = dc / count >= GLOBAL.CORRECT_CONSTANT;
                        var linksCorrect = lc / count >= GLOBAL.CORRECT_CONSTANT;
                        //Задание корректно только если по всем критериям корректно
                        var correct = titleCorrect && skillsCorrect && descCorrect && linksCorrect;

                        /*
                         Если задание полностью корректно, то експа начисляется по 1/4 за каждый отмеченный корректно пункт * експу за задание,
                         а скиллы начисляются только если большинство пунктов отмечено корректно.
                         Автору задания дается больше експы и очков скилла. В случае некорректного задания с автора снимается експа.
                         */
                        //Запишем в задание корректно ли оно
                        knex('tasks').where('id', '=', req.body.task_id).update({is_approved: correct}).then(function () {

                            var rawUpdateExp = "UPDATE users AS u SET exp = u.exp + map.exp FROM (VALUES \n";
                            //Начислим експу автору задания
                            rawUpdateExp += "(" + task.author + "," + (correct ? task.exp * GLOBAL.CORRECT_TASK_EXP_MULTIPLIER :
                                -task.exp * GLOBAL.INCORRECT_TASK_EXP_MULTIPLIER) + "),";

                            var rawUpdateSkills = "UPDATE user_skills AS us SET count = us.count + map.count FROM (VALUES \n";
                            if (correct) { //Начислим скиллы автору решения
                                for (var j in task.skills) rawUpdateSkills += "(" + task.author + ","
                                    + task.skills[j].skill_id + "," + task.skills[j].count + "),";
                            }

                            for (var i in approvers) {
                                var approver = approvers[i];
                                approver.titleCorrect = approver.title_correct === titleCorrect;
                                approver.skillsCorrect = approver.skills_correct === skillsCorrect;
                                approver.descCorrect = approver.desc_correct === descCorrect;
                                approver.linksCorrect = approver.links_correct === linksCorrect;

                                //Начислим експу подтвердившим
                                var exp = (approver.titleCorrect ? task.exp / 4 : 0) + (approver.skillsCorrect ? task.exp / 4 : 0)
                                    + (approver.descCorrect ? task.exp / 4 : 0) + (approver.linksCorrect ? task.exp / 4 : 0);
                                rawUpdateExp += "(" + approver.user_id + "," + exp + "),";

                                //Начислим скиллы подтвердившим
                                for (var j in task.skills) {
                                    var skill = task.skills[j];
                                    var skillCount = (approver.titleCorrect ? skill.count / 4 : 0) + (approver.skillsCorrect ? skill.count / 4 : 0)
                                        + (approver.descCorrect ? skill.count / 4 : 0) + (approver.linksCorrect ? skill.count / 4 : 0);
                                    rawUpdateSkills += "(" + approver.user_id + "," + skill.skill_id + ","
                                        + skillCount * GLOBAL.APPROVE_SKILLS_MULTIPLIER + "),";
                                }
                            }

                            rawUpdateExp = rawUpdateExp.slice(0, -1); //удаляем последнюю запятую
                            rawUpdateSkills = rawUpdateSkills.slice(0, -1); //удаляем последнюю запятую
                            rawUpdateExp += " ) AS map(id,exp) WHERE u.id = map.id;";
                            rawUpdateSkills += " ) AS map(user_id,skill_id,count) WHERE us.user_id = map.user_id AND us.skill_id = map.skill_id;";

                            knex.raw(rawUpdateExp).then(function () {
                                knex.raw(rawUpdateSkills).then(function () {
                                    //Уведомление автору задания
                                    knex('notifications').insert({
                                        user_id: task.author,
                                        type: 'your_task_approved_full',
                                        task_id: req.body.task_id}).then(function(){});
                                    //Уведомления остальным подтвердившим
                                    for (var i in approvers) {
                                        knex('notifications').insert({
                                            user_id: approvers[i].user_id,
                                            type: 'task_approved_full',
                                            task_id: req.body.task_id
                                        }).then(function () {});
                                    }
                                    //TODO: Уведомление sub_task_created_full друзьям автора задания (системы подписок пока что нет)
                                    console.log('Task with id ' + req.body.task_id + ' approved with result ' + correct);
                                }).catch(function (error) {
                                    console.log(error);
                                });
                            }).catch(function (error) {
                                console.log(error);
                            });
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                }).catch(function (error) {
                    console.log(error);
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
            var rawTask = "SELECT exp, is_approved, author, json_agg(r) as skills, approved, created, user_id IS NOT NULL as meta_exists FROM " +
                " (SELECT skill_id, count FROM task_skills WHERE task_id = " + req.body.task_id + ") AS r, tasks " +
                " LEFT JOIN tasks_meta AS tm ON tasks.id = tm.task_id AND tm.user_id = " + req.user.id +
                " WHERE id = " + req.body.task_id + " GROUP BY id, approved, created, meta_exists;";
            knex.raw(rawTask).then(function (task) {
                task = task.rows[0];
                //Нельзя подтвердить уже подтвержденное задание, то, что уже подтверждал, и то, что сам создал
                if (task.is_approved !== null || task.approved || task.created) {
                    res.end();
                }
                else {
                    knex('user_skills').where('user_id', '=', req.user.id).select('skill_id', 'count')
                        .then(function (userSkills) {
                            //Есть ли у подтверждающего скиллы для подтверждения этого задания
                            if (!userHasSkills(userSkills, task.skills)) {
                                res.end();
                            }
                            else callback(task, req, res, next);
                        }).catch(function (error) {
                        console.log(error);
                        res.end();
                    });
                }
            }).catch(function (error) {
                console.log(error);
                res.end();
            });
        }
        else res.end();
    };
};