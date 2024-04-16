//var fs = require('fs');
//var obj = JSON.parse(fs.readFileSync('skills.json', 'utf8'));
//var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var config = require(__dirname + '/config');
var knex = require('knex')(config.get('knex'));

Math.getRandomInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
Math.getRandomFloat = function (min, max) { return Math.random() * (max - min) + min; };

//var bookshelf = require('bookshelf')(knex);
//var temp;

/*knex('users').update({birthday: new Date("1995-02-12T22:00:00.000Z")}).where('id', '103').returning('*').then(function(user) {
 knex('users').select('birthday').where('id', '103').then(function(rows) {
 console.log(rows[0].birthday);
 }).catch(function (error) {
 console.log(error);
 });
 }).catch(function (error) {
 console.log(error);
 });*/

/*knex('tasks').then(function (tasks) {
 var max = 0.65, min = 0.1;
 for (var i in tasks) {
 var task = tasks[i];
 for (var j in task.skills) {
 knex('task_skills').insert({
 task_id: task.id,
 skill_id: task.skills[j],
 count: (Math.random() * (max - min) + min).toFixed(2)
 }).returning('*').then(function (rows) {
 console.log('Task: ' + rows[0].task_id + ', skill: ' + rows[0].skill_id + ', count: ' + rows[0].count);
 }).catch(function (error) {
 console.log(error);
 });
 }
 }
 }).catch(function (error) {
 console.log(error);
 });*/

/*var q = knex.select("tasks.*").from(function () {
    this.select("tasks.*").from('tasks').leftJoin('task_skills', 'tasks.id', '=', 'task_skills.task_id')
        .select(knex.raw("array_agg((skill_id, count)) AS skills")).groupBy('tasks.id')
        .select(knex.raw("array_agg(skill_id) AS skills_ids")).as('tasks');
}).andWhere('tasks.skills_ids', '&&', [57]).limit(20);

console.log(q.toString() + '\n');

q.then(function (rows) {
    console.log(rows);
}).catch(function (error) {
    console.log(error);
});*/

/*
var q = knex.select("solutions.*").from(function() {
    this.select("solutions.*").from('solutions')
        .where('solutions.id', 599138)
        .leftJoin('tasks', 'solutions.task_id', '=', 'tasks.id').select('tasks.title as task_title', 'tasks.exp as task_exp')
        .leftJoin('task_skills', 'solutions.task_id', '=', 'task_skills.task_id').as('tasks')
        .select(knex.raw("array_agg((skill_id, count)) AS skills")).groupBy('tasks.id', 'solutions.id')
        .select(knex.raw("array_agg(skill_id) AS skills_ids")).as('solutions');
});
q.leftJoin('users as u1', 'solutions.user_id', '=', 'u1.id').select('u1.name as user_name');
q.leftJoin('solutions_meta as sm', {'solutions.id': 'sm.solution_id', 'sm.user_id': 300359})
    .select('checked_correct', 'liked', knex.raw('solution_id IS NOT NULL as meta_exists'));
q.whereNull('checked_correct');
q.andWhere(function(){ this.where('liked', null).orWhere('liked', false); });

console.log(q.toString() + '\n');

q.then(function (rows) {
    console.log(rows);
}).catch(function (error) {
    console.log(error);
});
*/

/*var correct = true, user_correct = true, rating = 3, count = 3;
var raw = "UPDATE solutions SET rating = rating + " + (user_correct ? (3 || 5) : 1);
if (count === 3) raw += ", is_correct = " + correct;
raw += " WHERE id = " + 599138 + ";";
knex.raw(raw).then(function() {console.log('done')});*/

/*knex('solutions_meta').select('user_id', 'checked_correct').where('solution_id', 599138)
    .whereNotNull('checked_correct').then(function (solution_checkers) {
        console.log(solution_checkers);
        console.log(typeof solution_checkers[0].user_id);
        console.log(typeof solution_checkers[0].checked_correct);
    }).catch(function (error) {
        console.log(error);
    });*/


/*var rawTaskExpSkills = "SELECT exp, json_agg(r) as skills FROM tasks, " +
    "(SELECT skill_id, count FROM task_skills WHERE task_id = " + 287624 + ") AS r " +
    "WHERE id = " + 287624 + " GROUP BY id;";

knex.raw(rawTaskExpSkills).then(function (rows) {
    console.log(rows.rows[0]);
}).catch(function (error) {
    console.log(error);
});*/

/*var rawTask = "SELECT exp, is_approved, author, json_agg(r) as skills, approved, created, user_id IS NOT NULL as meta_exists FROM " +
    " (SELECT skill_id, count FROM task_skills WHERE task_id = " + 287624 + ") AS r, tasks " +
    " LEFT JOIN tasks_meta AS tm ON tasks.id = tm.task_id AND tm.user_id = " + 300356 +
    " WHERE id = " + 287624 + " GROUP BY id, approved, created, meta_exists;";

console.log(rawTask);

knex.raw(rawTask).then(function (rows) {
    console.log(rows.rows[0]);
}).catch(function (error) {
    console.log(error);
});*/

/*knex('skills').select('id').pluck('id').then(function (skills) {
    knex('users').select('id').pluck('id').then(function (users) {
        var insertCount = 80000, inserted = 0;

        var prevProgress = -1;
        function insertUserSkill() {
            var userSkill = {
                user_id: users[Math.getRandomInt(0, users.length - 1)],
                skill_id: skills[Math.getRandomInt(0, skills.length - 1)],
                need: Math.getRandomInt(0, 1) === 0
            };
            userSkill.count = Math.getRandomFloat(0, userSkill.need ? 0.7 : 2);
            knex('user_skills').insert(userSkill).then(function () {
                var progress = Math.floor(inserted * 100 / insertCount);
                if (++inserted < insertCount) {
                    if (progress !== prevProgress) { //Оптимизация вывода
                        console.log('User skills inserted: ' + progress + '%');
                        console.log('\033[2A');
                        prevProgress = progress;
                    }
                    insertUserSkill();
                }
                else console.log('All user skills inserted!')
            }).catch(function (error) {
                insertUserSkill();
            });
        }
        console.log('Inserting user skills...');
        insertUserSkill();

    }).catch(function (error) {
        console.log(error);
    });
}).catch(function (error) {
    console.log(error);
});*/


/* var q = knex('users').select('id').where('id', '>', 384952);
console.log(q.client);
return;
q.then(function(rows) {
    console.log('Users fetched...');
    var ins = [];
    var modified = 0, progress = 0, prevProgress = 0;
    for (var i in rows) {
        ins.push({
            content: 'dumb content',
            task_id: 599151,
            user_id: rows[i].id,
            is_correct: Math.getRandomInt(0, 1) ? true : false
        });
        progress = Math.round((modified++ / rows.length) * 100);
        if (progress != prevProgress) {
            knex('solutions').insert(ins).then(function() {
                console.log('\033[2A');
                console.log('Progress: ' + progress + '%   ');
            }).catch(function(err) {
            });
            ins = [];
        }
        prevProgress = progress;
    }
}); */

/*var q = knex.select("tasks.*").from(function () {
	this.select("tasks.*").from('tasks').leftJoin('task_skills', 'tasks.id', '=', 'task_skills.task_id')
		.select(knex.raw("array_agg((skill_id, count)) AS skills")).groupBy('tasks.id')
		.select(knex.raw("array_agg(skill_id) AS skills_ids")).as('tasks');
});
q.leftJoin('users', 'tasks.author', '=', 'users.id').select('users.name as author_name');
q.leftJoin('tasks_meta as tm', {'tasks.id': 'tm.task_id', 'tm.user_id': 599202}).select('done', 'approved', 'created', 'received', 'liked');
console.time("dbsave");
q.limit(20).then(function(rows) {
	var ids = rows.map(function(el) {return el.id;});
	if (true) {
		knex('solutions').select(knex.raw('solutions.task_id as id, count("solutions"."id") as "solved_count", SUM(CASE WHEN solutions.is_correct THEN 1 ELSE 0 END) as "solved_count_correct" ')).whereIn('solutions.task_id', ids)
		.groupBy('solutions.task_id')
		.then(function(counts) {
			for (var i in rows) {
				for (var j in counts) if (rows[i].id == counts[j].id) {
					rows[i].solved_count = counts[j].solved_count;
					rows[i].solved_count_correct = counts[j].solved_count_correct;
					break;
				}
			}
			console.timeEnd("dbsave");
			console.log(rows);
		});
	}	
});*/

var req = {body: {task_id: 599152}, user: {id: 30000}};

/*var query = knex.select("ntfs.*").from('notifications as ntfs').where('ntfs.user_id', req.user.id);
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
query.then(function(rows) {
    console.log(rows);
}).catch(function (error) {
    console.log(error);
});*/

return;

//Добавить тестовых юзверей и заданий
knex('skills').then(function(skills){
    //Константы
    var usersCount = 100000, tasksCount = 100000;
    //Для большей производительности поставить все на false (особенно влияет hashPsw)
    var appendNeeds = false, hashPsw = false, randomAuthorPerTask = false;

    function insertTasks() {
        var num = Math.getRandomInt(1, 1000000000);
        knex('tasks').insert({
            title: 'title_' + num,
            description: 'desc_' + num,
            exp: 123,
            author: randomAuthorPerTask ? usersIds[Math.getRandomInt(0, usersIds.length - 1)] : author
        }).then(function () {
            console.log('Duplicate tasks: ' + duplicateTasks);
            console.log('Task #' + inserted++ + ' inserted!');
            if (inserted === tasksCount) {
                console.log('\033[2A');
                console.log('All tasks inserted!          ');
                knex('users').then(function(rows_u) {
                    console.log('\nUsers selected: ' + rows_u.length);
                    knex('tasks').then(function(rows_t) {
                        console.log('\nTasks selected: ' + rows_t.length);
                    }).catch(function (error) {
                        console.log(error);
                    });
                }).catch(function (error) {
                    console.log(error);
                });
            }
            else {
                console.log('\033[3A');
                insertTasks();
            }
        }).catch(function () {
            duplicateTasks++;
            insertTasks();
        });
    }

    var author = 0, inserted = 0, usersIds = [], duplicateUsers = 0, duplicateTasks = 0;
    function insertUsers() {
        var num = Math.getRandomInt(1, 1000000000);

        var user = {
            nick: 'nick_' + num,
            name: 'name_' + num,
            email: 'email_' + num + '@gmail.com',
            pswhash: hashPsw ? bcrypt.hashSync('' + num, bcrypt.genSaltSync(4)) : '$2a$04$cWI7zFjUcC62UYTb3rj60.l4Ag4eGCkUrQVe6xJvNv//xa4cG2kVG',
            exp: 1234
        };

        if (appendNeeds) {
            var needsCount = Math.getRandomInt(1, 7);
            var needs = [];
            for (var j = 0; j < needsCount; j++) needs.push(skills[Math.getRandomInt(0, skills.length - 1)].id);
            user.needs = needs;
        }

        knex('users').insert(user).returning('id').then(function(ids){
            if (randomAuthorPerTask) usersIds.push(ids[0]);
            console.log('Duplicate users: ' + duplicateUsers);
            console.log('User #' + inserted++ + ' inserted!');
            if (inserted === usersCount) {
                author = ids[0];
                inserted = 0;
                console.log('\033[2A');
                console.log('All users inserted!          ');
                console.log('\nInserting tasks...           ');
                insertTasks();
            }
            else {
                console.log('\033[3A');
                insertUsers();
            }
        }).catch(function () {
            duplicateUsers++;
            insertUsers();
        });
    }

    console.log('Inserting users...');
    insertUsers();
}).catch(function (error) {
    console.log(error);
});

/*knex.select("users.*").from('users').leftJoin('user_skills', 'id', '=', 'user_id').select(knex.raw("array_agg((skill_id, count)) AS skills"))
 .groupBy('id').limit(1).offset(0).then(function(rows) {
 console.log(rows[0]);
 }).catch(function (error) {
 console.log(error);
 });*/

/*knex('users').where('id', 14).update({pswhash: bcrypt.hashSync('1')}).returning('pswhash').then(function (pswhash) {
 console.log(bcrypt.compareSync('1', pswhash[0]));
 });*/

/*knex('approvements').returning('id').insert({task_id: 'cf133be1-3e14-4678-acce-821684098d79'})
 .then(function(id) {
 console.log(id);
 return;
 });*/

/*    var q = knex.select("tasks.*").from('tasks');
 q.join('users', 'tasks.author', '=', 'users.id').select('users.name as author_name');
 q.limit(10).offset(0);

 q.then(function(rows) {
 console.log(rows);

 }).catch(function (error) {
 console.log(error);
 });*/

/*knex.raw("UPDATE solutions SET is_correct = true WHERE id = '248ab5b8-52a7-4a6a-8f25-0927cab2dec4' RETURNING likes, checked_correct, checked_incorrect;")
 .then(function(ans) {
 console.log(ans.rows);
 });*/

/*skillsProgress.increment(['2178d930-0365-4962-89f2-58fbfe28c996'],
 '{"(5a0574cc-66b7-4c89-9950-03a2eea0c701,1)","(8b33a559-a0b4-47da-a27e-84439cdecf9c,1)"}',
 [{id: '5a0574cc-66b7-4c89-9950-03a2eea0c701', count: 1}, {id: '8b33a559-a0b4-47da-a27e-84439cdecf9c'}])
 .then(console.log).catch(console.log);*/
/*var a = 0;

 knex.select("users.nick", knex.raw("array_agg((skill_id, count)) AS skills")).from('users')
 .leftJoin('user_skills', 'id', '=', 'user_id')
 .groupBy('id').then(function (rows) {
 console.log(a);
 clearInterval(id);
 }).catch(console.log);

 var id = setInterval(function () {a++;});*/

/*
 var User = bookshelf.Model.extend({
 tableName: 'users',
 defaults: {
 id: temp = uuid.v4(),
 nick: '',
 name: '',
 email: '',
 pswhash: ''
 }
 });

 new User()
 .save()
 .then(function() {
 new User({'id': temp})
 .set({
 nick: 'nick11',
 name: 'fsdfsadfasdf',
 email: 'sdfasdfadf',
 pswhash: '111'
 })
 .save()
 .then(function(model) {
 console.log(model.get('name'));
 });
 });
 */
