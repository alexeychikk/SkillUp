
module.exports = function (knex, req, res, next) {
    var query = knex.select("users.*");
    if (req.body.id) query.where('users.id', req.body.id);
    else if (req.body.ids) query.whereIn('users.id', req.body.ids);
    if (req.body.without_self) query.where('users.id', '!=', req.user.id);
    query.leftJoin('user_skills', 'id', '=', 'user_id').select(knex.raw("array_agg((skill_id, count, need)) AS skills"));
    if (req.body.skills) {
        var subquery = knex('user_skills').select('user_id', knex.raw('count(skill_id) as cs'), knex.raw('sum(count) as sc'))
            .where('count', '>', 0).whereIn('skill_id', req.body.skills).groupBy('user_id')
            .orderByRaw('cs desc, sc desc')
            .limit(req.body.limit > 100 ? 20 : req.body.limit || 20).offset(req.body.offset || 0);
        query.from(knex.raw('(' + subquery.toString() + ') as subt, users')).whereRaw('users.id = subt.user_id')
            .groupBy('id', 'subt.cs', 'subt.sc').orderByRaw('subt.cs desc, subt.sc desc');
    }
    else query.from('users').limit(req.body.limit > 100 ? 20 : req.body.limit || 20).offset(req.body.offset || 0).groupBy('id');
    query.then(function(rows) {
        res.end(JSON.stringify(rows));
    }).catch(function (error) {
        console.log(error);
        res.end();
    });
};