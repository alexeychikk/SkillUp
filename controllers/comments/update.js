module.exports = function(knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || !req.body.id) {
            return res.end();
        }
        var q = knex('comments').where('author', req.user.id).andWhere('id', req.body.id);

        //Если есть контент обновляем, если нет удаляем
        if (req.body.content) {
            q.update({
                content: req.body.content
            });
        } else {
            q.del();
        }

        q.returning('id').then(function (ids) {
            if (!ids) res.end('not found');
            else res.end('updated');
        }).catch(function (error) {
            res.end('error');
            console.log(error);
        });
    };
};
