
module.exports = function (knex) {
    return function (task_id, data, user_id) {
        var query = "UPDATE approvements SET ";

        if (data.title) query += "title_correct = title_correct ";
        else  query += "title_incorrect = title_incorrect ";
        query += "|| '{" + user_id + "}', ";

        if (data.skills) query += "skills_correct = skills_correct ";
        else  query += "skills_incorrect = skills_incorrect ";
        query += "|| '{" + user_id + "}', ";

        if (data.desc) query += "desc_correct = desc_correct ";
        else  query += "desc_incorrect = desc_incorrect ";
        query += "|| '{" + user_id + "}', ";

        if (data.links) query += "links_correct = links_correct ";
        else  query += "links_incorrect = links_incorrect ";
        query += "|| '{" + user_id + "}' WHERE task_id = '" + task_id + "' returning *;";

        return knex.raw(query);
    };
};