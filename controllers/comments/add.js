module.exports = function(knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || !req.body.src || !req.body.content) {
            return res.end();
        }

        knex('comments').insert({
            author: req.user.id,
            src: req.body.src,
            content: req.body.content
        }).then(function () {
            res.end('added');
        }).catch(function (error) {
            res.end('error');
            console.log(error);
        });
    };
};
