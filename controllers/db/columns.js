module.exports = function(knex) {
    return function (req, res, next) {
        if (req.user.role !== 'пользователь') {
            knex(req.params.table).columnInfo().then(function (info) {
                res.end(JSON.stringify(info));
            }).catch(function (error) {
                console.log(error);
                res.error(error);
            });
        } else {
            console.log('Попытка получить доступ без прав админитратора');
            res.error('Попытка получить доступ без прав админитратора');
        }
    }
};
