(function () {
    angular
        .module('skillup')
        .factory('getRowsOnPage', getRowsOnPage);

    function getRowsOnPage() {
        /**
         * @param {array} rows              Массив данных в виде {object}
         * @param {number} rowsPerPage      Кол-во данных на странице
         * @param {number} pageNumber       Номер страницы
         * @param {number} rowsCount        Общее количество данных в таблице БД
         *
         * @return {array}                  Часть входного массива определенная количеством данных на странице или пустой массив
         */
        return function (rows, rowsPerPage, pageNumber, rowsCount) {
            if (!rows) return [];
            var to = rowsPerPage * (pageNumber + 1);
            if (to > rowsCount) to = rowsCount;
            return rows.slice(rowsPerPage * pageNumber, to);
        }
    }
})();