module.exports = function(knex) {
    return function (req, res, next) {
        knex(req.params.table).count('id').then(function (data) {
            res.end(JSON.stringify(data[0].count));
        }).catch(function (error) {
            console.log(error);
            res.error(error);
        });
    }
};