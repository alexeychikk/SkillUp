module.exports = function(knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || req.user.role === 'пользователь' || !req.body.skill || !req.body.skill.id || !req.body.skill.title) {
            return res.end();
        }

        knex('skills').where('id', req.body.skill.id).update({title: req.body.skill.title}).then(function () {
            //Если в переменной children или parents значение "null", это значит, что их не надо изменять в таблице
            if (req.body.skill.children === null && req.body.skill.parents !== null) {
                knex('skills_meta').where('skill_id', req.body.skill.id).del().then(function () {
                    knex('skills_meta').insert(req.body.skill.parents).then(function () {
                        res.end('ok');
                    });
                });
            } else if (req.body.skill.parents === null && req.body.skill.children !== null) {
                knex('skills_meta').where('parent_id', req.body.skill.id).del().then(function () {
                    knex('skills_meta').insert(req.body.skill.children).then(function () {
                        res.end('ok');
                    });
                });
            } else if (req.body.skill.parents !== null && req.body.skill.children !== null) {
                knex('skills_meta').where('skill_id', req.body.skill.id).orWhere('parent_id', req.body.skill.id).del().then(function () {
                    knex('skills_meta').insert(req.body.skill.parents.concat(req.body.skill.children)).then(function () {
                        res.end('ok');
                    });
                });
            } else {
                res.end('ok');
            }
        }).catch(function (error) {
            res.end('error');
            console.log(error);
        });
    };
};
