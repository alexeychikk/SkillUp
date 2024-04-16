
module.exports = function (knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated()) return res.end();
        if (req.body.remove) { //Если нужно убрать скилы из needs
            knex('user_skills').update('need', false).where('user_id', req.user.id).whereIn('skill_id', req.body.needs).then(function () {
                res.end('removed');
            }).catch(function (err) {
                console.log(err);
                res.end();
            });
        }
        else { //Если нужно добавить скилы в needs
            //Выберем скилы и нидсы пользователя
            knex('user_skills').where('user_id', req.user.id).select('skill_id', 'count', 'need').then(function (skills) {
                //Отфильтруем скилы на вставку и на обновление
                var insertSkills = [], updateSkills = [];
                for (var i in req.body.needs) {
                    var tempSkill = null;
                    for (var j in skills) {
                        if (req.body.needs[i] == skills[j].skill_id) {
                            tempSkill = skills[j];
                            break;
                        }
                    }
                    if (tempSkill === null) insertSkills.push({
                        user_id: req.user.id,
                        skill_id: req.body.needs[i],
                        need: true
                    });
                    //В needs можно добавить только скилы, которые у тебя прокачаны меньше чем на 1
                    else if (tempSkill.count < 1) updateSkills.push(tempSkill.skill_id);
                }
                knex('user_skills').update('need', true).where('user_id', req.user.id).whereIn('skill_id', updateSkills).then(function () {
                    knex('user_skills').insert(insertSkills).then(function () {
                        res.end('added')
                    }).catch(function (err) {
                        console.log(err);
                        res.end();
                    });
                }).catch(function (err) {
                    console.log(err);
                    res.end();
                });
            }).catch(function (err) {
                console.log(err);
                res.end();
            });
        }
    };
};