
module.exports = function(knex, userHasSkills) {
    function callback(solution, task, req, res, next) {
        var rating = req.body.is_correct ? (req.body.rating || 5) : 1;
        var query = knex('solutions_meta'); //Запишем в таблицу solutions_meta результат проверки (req.body.is_correct)
        var meta = {checked_correct: req.body.is_correct, rating: rating};
        //Если запись для текущего проверяющего есть - update
        if (solution.meta_exists) query.update(meta).where('solution_id', req.body.solution_id).andWhere('user_id', req.user.id);
        else { //иначе - insert
            meta.solution_id = req.body.solution_id;
            meta.user_id = req.user.id;
            query.insert(meta);
        }
        query.then(function () {
            //Вытащим для решения id всех проверивших и результаты их проверки (checked_correct)
            knex('solutions_meta').select('user_id', 'checked_correct').where('solution_id', req.body.solution_id)
                .whereNotNull('checked_correct').then(function (solutionCheckers) {
                    var checkersCount = solutionCheckers.length;

                    if (checkersCount === GLOBAL.COUNT_TO_CHECK) { //Если количество проверивших достаточное - выносим решению приговор
                        var correctLength = 0, incorrectLength = 0;
                        for (var i in solutionCheckers) {
                            if (solutionCheckers[i].checked_correct) correctLength++;
                            else incorrectLength++;
                        }
                        var correct = correctLength / checkersCount >= GLOBAL.CORRECT_CONSTANT; //Корректно ли решение
                    }

                    //Добавим в решение рейтинг текущего проверяющего (если есть) и заодно запишем, корректно ли решение
                    var rawUpdateSolution = "UPDATE solutions SET rating = rating + " + rating;
                    if (checkersCount === GLOBAL.COUNT_TO_CHECK) rawUpdateSolution += ", is_correct = " + correct;
                    rawUpdateSolution += " WHERE id = " + req.body.solution_id + ";";

                    knex.raw(rawUpdateSolution).then(function () {
                        res.end('ok');
                        if (checkersCount === GLOBAL.COUNT_TO_CHECK) {
                            //Начислим експу всем проверившим. Автору решения експа не начисляется
                            var rawUpdateExp = "UPDATE users AS u SET exp = u.exp + map.exp FROM (VALUES \n";

                            var rawUpdateSkills = "UPDATE user_skills AS us SET count = us.count + map.count FROM (VALUES \n";
                            if (correct) { //Обновим скиллы автору решения (которые у него уже есть)
                                for (var j in task.skills) rawUpdateSkills += "(" + solution.user_id + ","
                                    + task.skills[j].skill_id + "," + task.skills[j].count + "),";
                            }

                            for (var i in solutionCheckers) {
                                //Если оценка проверяющего совпадает с большинством - начислим ему експу и скиллы
                                if (solutionCheckers[i].checked_correct === correct) {
                                    rawUpdateExp += "(" + solutionCheckers[i].user_id + "," + task.exp + "),";

                                    for (var j in task.skills) rawUpdateSkills += "(" + solutionCheckers[i].user_id + ","
                                        + task.skills[j].skill_id + "," + task.skills[j].count * GLOBAL.CHECK_SKILLS_MULTIPLIER + "),";
                                }
                            }

                            rawUpdateExp = rawUpdateExp.slice(0, -1); //удаляем последнюю запятую
                            rawUpdateSkills = rawUpdateSkills.slice(0, -1); //удаляем последнюю запятую
                            rawUpdateExp += " ) AS map(id,exp) WHERE u.id = map.id;";
                            rawUpdateSkills += " ) AS map(user_id,skill_id,count) WHERE us.user_id = map.user_id AND us.skill_id = map.skill_id;";

                            knex.raw(rawUpdateExp).then(function () {
                                knex.raw(rawUpdateSkills).then(function () {
                                    if (correct) {
                                        //Добавим скиллы автору решения (которые отсутствовали при обновлении)
                                        knex('user_skills').select('skill_id').where('user_id', solution.user_id).pluck('skill_id').then(function (us) {
                                            var newSkills = []; //Отфильтруем только те скиллы, которых у решившего нет
                                            for (var i in task.skills) {
                                                if (us.indexOf(task.skills[i].skill_id) === -1) newSkills.push({
                                                    user_id: solution.user_id,
                                                    skill_id: task.skills[i].skill_id,
                                                    count: task.skills[i].count
                                                });
                                            }
                                            if (newSkills.length) { //Если новые скиллы появились - вставляем
                                                knex('user_skills').insert(newSkills).then(function () {
                                                }).catch(function (error) {
                                                    console.log(error);
                                                });
                                            }
                                        }).catch(function (error) {
                                            console.log(error);
                                        });
                                    }
                                }).catch(function (error) {
                                    console.log(error);
                                });
                            }).catch(function (error) {
                                console.log(error);
                            });
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
    }

    return function (req, res, next) {
        if (req.isAuthenticated()) {
            knex('solutions').where('id', '=', req.body.solution_id).select('is_correct', 'solutions.task_id', 'solutions.user_id')
                .leftJoin('solutions_meta as sm', {'solutions.id': 'sm.solution_id', 'sm.user_id': req.user.id})
                .select('checked_correct', knex.raw('solution_id IS NOT NULL as meta_exists'))
                .then(function(solution) {
                    solution = solution[0];
                    //Нельзя проверить уже проверенное, свое решение или то, что уже проверял
                    if (solution.is_correct !== null || solution.user_id === req.user.id || solution.checked_correct !== null) {
                        res.end();
                    }
                    else { //Вытащим експу и скиллы задания
                        var rawTaskExpSkills = "SELECT exp, json_agg(r) as skills FROM tasks, " +
                            " (SELECT skill_id, count FROM task_skills WHERE task_id = " + solution.task_id + ") AS r " +
                            " WHERE id = " + solution.task_id + " GROUP BY id;";
                        knex.raw(rawTaskExpSkills).then(function (task) {
                            task = task.rows[0];
                            knex('user_skills').where('user_id', '=', req.user.id).select('skill_id', 'count')
                                .then(function (userSkills) { //Есть ли у проверяющего скиллы для проверки
                                    if (!userHasSkills(userSkills, task.skills)) {
                                        res.end();
                                    }
                                    else callback(solution, task, req, res, next);
                                }).catch(function (error) {
                                    console.log(error);
                                    res.end();
                                });
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