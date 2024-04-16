module.exports = function(knex) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || !req.body.comment_id) {
            return res.end();
        }

        knex('comments_meta').where('comment_id', req.body.comment_id).andWhere('user_id', req.user.id).select('liked').then(function(rows) {
            var meta_exists = rows.length > 0;
            var liked = meta_exists && rows[0].liked;
            var value = {liked: !liked};

            var query = knex('comments_meta');
            if (meta_exists) query.update(value).where('comment_id', req.body.comment_id).andWhere('user_id', req.user.id);
            else {
                value.comment_id = req.body.comment_id;
                value.user_id = req.user.id;
                query.insert(value);
            }
            query.then(function() {
                knex('comments').where('id', req.body.comment_id).increment('likes', liked ? -1 : 1).then(function () {
                    res.end('ok');
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
    };
};
