module.exports = function (knex) {
    return function(req, res, next) {
        /*
         Пытаясь построить SQL запросы с вложенным вытаскиванием данных (к примеру, по solution_id делаем left join solutions,
         оттуда вытаскиваем user_id и по нему присоединяем имя решившего), я понял, что лучше использовать существующие поля в notifications.
         Не веришь - попробуй сам :)
         Уведомление, описание, какие дополнительные поля будут использованы при конкретном виде уведомления
         'your_task_solved' (ваше задание решили): solution_id, task_id, other_user_id
         'your_solution_checked' (ваше решение проверили): solution_id, task_id, other_user_id
         'solution_checked' (проверили решение, которое вы проверили): solution_id, task_id, other_user_id
         'task_approved' (подтвердили задание, которое вы подтвердили): approvement_id, task_id, other_user_id
         'your_task_approved' (ваше задание подтвердили): approvement_id, task_id, other_user_id
         'your_solution_checked_full' (ваше решение проверили полностью): solution_id, task_id, other_user_id
         'solution_checked_full' (полностью проверили решение, которое вы проверили): solution_id, task_id
         'task_approved_full' (полностью подтвердили задание, которое вы подтвердили): task_id
         'your_task_approved_full' (ваше задание полностью подтвердили): task_id
         'task_liked' (ваше задание лайкнули): task_id, other_user_id
         'solution_liked' (ваше решение лайкнули): solution_id, task_id, other_user_id
         'task_commented' (ваше задание прокомментили): task_id, comment_id, other_user_id
         'solution_commented' (ваше решение прокомментили): solution_id, task_id, comment_id, other_user_id
         'task_received' (ваше задание взяли): task_id, other_user_id
         'user_subscribed' (на вас подписался пользователь): other_user_id
         'skill_up' (уровень вашего умения поднялся): skill_id
         'comment_liked' (ваш комментарий лайкнули): comment_id, other_user_id
         'comment_replied' (на ваш комментарий ответили): comment_id, other_comment_id, other_user_id
         'sub_task_solved' (ваш друг решил задание): solution_id, task_id, other_user_id
         'sub_solution_checked' (ваш друг проверил решение): solution_id, task_id, other_user_id
         'sub_task_approved' (ваш друг подтвердил задание): approvement_id, task_id, other_user_id
         'sub_task_created' (ваш друг создал задание): task_id, other_user_id
         'sub_task_solved_full' (полностью проврелили решение вашего друга): solution_id, task_id, other_user_id
         'sub_solution_checked_full' (полностью проверили решение, которое проверил ваш друг): solution_id, task_id, other_user_id
         'sub_task_approved_full' (полностью подтвердили  задание, которое подтвердил ваш друг): task_id, other_user_id
         'sub_task_created_full' (полностью подтвердили задание вашего друга): task_id, other_user_id
         'sub_skill_up' (уровень умения вашего друга поднялся): skill_id, other_user_id
         */
        if (req.isAuthenticated()) {
            var query = knex.select("ntfs.*").from('notifications as ntfs').where('ntfs.user_id', req.user.id);
            if (req.body.read) query.where('ntfs.read', true);
            else if (req.body.read === false) query.where('ntfs.read', false);
            if (req.body.type) query.where('ntfs.type', req.body.type);
            query.leftJoin('tasks', 'tasks.id', '=', 'ntfs.task_id')
                .select('tasks.title as task_title', 'tasks.is_approved as task_is_approved');
            query.leftJoin('solutions as sols', 'sols.id', '=', 'ntfs.solution_id')
                .select('sols.is_correct as solution_is_correct');
            query.leftJoin('solutions_meta as sm', {'sm.solution_id': 'ntfs.solution_id', 'sm.user_id': 'ntfs.other_user_id'})
                .select('sm.checked_correct as sm_checked_correct');
            query.leftJoin('approvements as appr', 'appr.id', '=', 'ntfs.approvement_id')
                .select('appr.title_correct as appr_title_correct', 'appr.skills_correct as appr_skills_correct',
                'appr.desc_correct as appr_desc_correct', 'appr.links_correct as appr_links_correct');
            query.leftJoin('user_skills as us', {'us.user_id': 'ntfs.other_user_id', 'us.skill_id': 'ntfs.skill_id'})
                .select('us.count as us_count', 'us.need as us_need');
            query.leftJoin('users', 'users.id', '=', 'ntfs.other_user_id')
                .select('users.name as other_user_name');
            query.leftJoin('comments as cmnt', 'cmnt.id', '=', 'ntfs.comment_id')
                .select('cmnt.content as comment_content');
            query.leftJoin('comments as ocmnt', 'ocmnt.id', '=', 'ntfs.other_comment_id')
                .select('ocmnt.content as other_comment_content');
            query.orderBy('ntfs.date_created').limit(req.body.limit > 100 ? 20 : req.body.limit || 20).offset(req.body.offset || 0);
            query.then(function (rows) {
                res.end(JSON.stringify(rows));
            }).catch(function (error) {
                console.log(error);
                res.end();
            });
        } else res.end();
    };
};
