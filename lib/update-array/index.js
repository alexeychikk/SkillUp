

module.exports = function (knex) {
    return function (table, column, rowID, operation, value) {
        return knex.raw("UPDATE " + table + " SET " + column + " = array_" + operation +
            "(" + column + ", '" + value + "') WHERE id = '" + rowID + "';");
    };
};