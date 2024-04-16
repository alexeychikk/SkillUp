module.exports = function (knex) {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            knex('notifications').where('user_id', req.user.id).whereIn('id', req.body.ids).update({read: true})
                .then(function() {
                    res.end('ok');
                }).catch(function (error) {
                    console.log(error);
                    res.end();
                });
        } else res.end();
    };
};