module.exports = function(knex, req, res, next) {
    var q = knex('comments').select('comments.*');
    if (req.body.src) q.where('src', req.body.src);
    else q.where('author', req.user.id);

    q.leftJoin('users', 'users.id', 'comments.author').select(['users.avatar as author_avatar', 'users.name as author_name']);
    q.leftJoin('comments_meta as cm', {'cm.comment_id': 'comments.id', 'cm.user_id': req.user.id}).select('cm.liked as liked');
    q.limit(req.body.limit > 100 ? 20 : req.body.limit || 20).offset(req.body.offset || 0);
    q.orderBy('date_created', 'asc');
    q.then(function (rows) {
        if (!rows) res.end();
        res.end(JSON.stringify(rows));
    }).catch(function (error) {
        res.end('error');
        console.log(error);
    });
};
