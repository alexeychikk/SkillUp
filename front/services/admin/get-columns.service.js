(function () {
    angular
        .module('skillup')
        .factory('getColumns', getColumns);

    getColumns.$inject = ['$http'];

    function getColumns($http) {
        /**
         *  Модифицирует table, добавляя свойства:
         *                              columns     (object)    содержит названия и параметры колонок таблицы
         *                              columnNames (array)     названия колонок
         *
         * @param {object} table    Объект, содержащий свойства:
         *                              name        (string)    имя таблицы
         *                              rows        (array)     данные таблицы
         *                              ...
         */
        return function (table) {
            $http.get('/db/' + table.name + '/columns').success(function (data) {
                table.columns = data;
                table.columnNames = Object.getOwnPropertyNames(data);
            });
        };
    }
})();