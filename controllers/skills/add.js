module.exports = function(knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || req.user.role === 'пользователь' || !req.body.skill || !req.body.skill.title) {
            return res.end();
        }
        var parents = [], children = [];

        knex('skills').insert({title: req.body.skill.title}).returning('id').then(function (id) {
            for (var obj1 in req.body.skill.parents) {
                parents.push({skill_id: id[0], parent_id: req.body.skill.parents[obj1].id});
            }
            for (var obj2 in req.body.skill.children) {
                children.push({skill_id: req.body.skill.children[obj2].id, parent_id: id[0]});
            }

            knex('skills_meta').insert(parents.concat(children)).then(function () {
                res.end(id[0].toString());
            }).catch(function (error) {
                res.end('error');
                console.log(error);
            });
        }).catch(function (error) {
            res.end('error');
            console.log(error);
        });
    };
};
