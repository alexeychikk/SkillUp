
module.exports = function(knex, req, res, next) {
    var q = knex.select("tasks.*").from(function () {
        this.select("tasks.*").from('tasks').leftJoin('task_skills', 'tasks.id', '=', 'task_skills.task_id')
            .select(knex.raw("array_agg((skill_id, count)) AS skills")).groupBy('tasks.id')
            .select(knex.raw("array_agg(skill_id) AS skills_ids")).as('tasks');
        if (req.body.id) this.where('tasks.id', req.body.id);
        else if (req.body.ids) this.whereIn('tasks.id', req.body.ids);
    });
    if (req.body.skills) q.andWhere('tasks.skills_ids', (req.body.filters && req.body.filters.for_approving)
        ||req.body.completed_skills ? '<@' : '&&', req.body.skills);
    q.leftJoin('users', 'tasks.author', '=', 'users.id').select('users.name as author_name');
    q.leftJoin('tasks_meta as tm', {'tasks.id': 'tm.task_id', 'tm.user_id': parseInt(req.user.id)}).select('done', 'approved', 'created', 'received', 'liked');
    if (req.body.filters) {
        if (req.body.filters.for_solving || req.body.filters.is_approved === true) q.andWhere('tasks.is_approved', true);
        else if (req.body.filters.is_approved === false) q.andWhere('tasks.is_approved', false);
        // Не менять на просто else, чтобы можно было загружать все задания, указав в is_approved любое,
        // отличное от true, false или undefined значение
        else if (req.body.filters.for_approving || req.body.filters.is_approved === undefined) q.whereNull('tasks.is_approved');

        if (req.body.filters.for_solving || req.body.filters.for_approving ||  req.body.filters.not_in_created) q.andWhere('created', false);
        if (req.body.filters.for_approving || req.body.filters.not_in_approved) q.andWhere('approved', false);
        if (req.body.filters.for_solving || req.body.filters.not_in_done) q.andWhere('done', false);

        if (req.body.filters.received === true) q.andWhere('received', true);
        else if (req.body.filters.received === false) q.andWhere('received', false);

        if (req.body.filters.liked === true) q.andWhere('liked', true);
        else if (req.body.filters.liked === false) q.andWhere('liked', false);
    }
    q.limit(req.body.limit > 100 ? 20 : req.body.limit || 20).offset(req.body.offset || 0);
    if (!req.body.sort || !req.body.sort.columnName || !req.body.sort.direction) q.orderBy('is_approved', 'asc').orderBy('title', 'asc');
    else if (req.body.sort.columnName == 'title') q.orderBy('is_approved', 'asc').orderBy(req.body.sort.columnName, req.body.sort.direction);
    else q.orderBy('is_approved', 'asc').orderBy(req.body.sort.columnName, req.body.sort.direction).orderBy('title', 'asc');

    q.then(function(tasks) {
        if (!tasks) res.end();
        else if(req.body.solutionsCount) {
            knex.select('solutions.task_id as id').count('solutions.id as solved_count')
                .select(knex.raw('SUM(CASE WHEN solutions.is_correct THEN 1 ELSE 0 END) as "solved_count_correct"'))
                .from('solutions').groupBy('solutions.task_id')
                .then(function (solutions) {
                    for (var tskID in tasks) {
                        var task = tasks[tskID];
                        for (var sltID in solutions) {
                            var solution = solutions[sltID];
                            if (task.id == solution.id) {
                                task.solved_count = solution.solved_count;
                                task.solved_count_correct = solution.solved_count_correct;
                                break;
                            }
                        }
                    }
                    res.end(JSON.stringify(tasks));
                })
        } else {
            res.end(JSON.stringify(tasks));
        }
    }).catch(function (error) {
        console.log(error);
        res.end();
    });
};