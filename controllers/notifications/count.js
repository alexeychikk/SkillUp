module.exports = function (knex) {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            knex('notifications').where('user_id', req.user.id).andWhere('read', false).count('id').then(function(rows) {
                res.end(JSON.stringify(rows[0]));
            }).catch(function (error) {
                console.log(error);
                res.end();
            });
        } else res.end();
    };
};