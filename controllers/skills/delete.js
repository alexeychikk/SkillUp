module.exports = function(knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || req.user.role === 'пользователь' || !req.body.skills) {
            return res.end();
        }

        knex('skills').whereIn('id', req.body.skills).del().then(function () {
            res.end('ok');
        }).catch(function (error) {
            res.end('error');
            console.log(error);
        });
    };
};
