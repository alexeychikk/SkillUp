
module.exports = function (knex, req, res, next) {
    var q = knex.select("solutions.*").from(function() {
        this.select("solutions.*").from('solutions')
            .leftJoin('tasks', 'solutions.task_id', '=', 'tasks.id').select('tasks.title as task_title', 'tasks.exp as task_exp')
            .leftJoin('task_skills', 'solutions.task_id', '=', 'task_skills.task_id').as('tasks')
            .select(knex.raw("array_agg((skill_id, count)) AS skills")).groupBy('tasks.id', 'solutions.id')
            .select(knex.raw("array_agg(skill_id) AS skills_ids")).as('solutions');
        if (req.body.filters && req.body.filters.for_checking) this.select('tasks.description as task_description');
        if (req.body.id) this.where('solutions.id', req.body.id);
        else if (req.body.ids) this.whereIn('solutions.id', req.body.ids);
    });
    q.leftJoin('users as u1', 'solutions.user_id', '=', 'u1.id').select('u1.name as user_name');
    q.leftJoin('solutions_meta as sm', {'solutions.id': 'sm.solution_id', 'sm.user_id': req.user.id}).select('checked_correct', 'liked');
    if (req.body.skills) q.andWhere('solutions.skills_ids', ((req.body.filters && req.body.filters.for_checking) || req.body.completed_skills)
        ? '<@' : '&&', req.body.skills);
    if (req.body.filters) {
        if (req.body.filters.for_checking || req.body.filters.is_correct === undefined) q.whereNull('solutions.is_correct');
        else if (req.body.filters.is_correct === true) q.andWhere('solutions.is_correct', true);
        // Не менять на просто else, чтобы можно было загружать все решения, указав в is_correct любое,
        // отличное от true, false или undefined значение
        else if (req.body.filters.is_correct === false) q.andWhere('solutions.is_correct', false);

        if (req.body.filters.for_checking || req.body.filters.not_in_checked) q.whereNull('checked_correct');
        if (req.body.filters.for_checking || req.body.filters.not_own) q.andWhere('solutions.user_id', '!=', req.user.id);

        if (req.body.filters.liked === true) q.andWhere('liked', true);
        else if (req.body.filters.liked === false) q.andWhere('liked', false);
    }
    q.limit(req.body.limit > 100 ? 20 : req.body.limit || 20).offset(req.body.offset || 0);

    q.then(function (rows) {
        if (!rows) res.end();
        else res.end(JSON.stringify(rows));
    }).catch(function (error) {
        console.log(error);
        res.end();
    });
};