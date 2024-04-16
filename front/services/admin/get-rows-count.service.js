(function () {
    angular
        .module('skillup')
        .factory('getRowsCount', getRowsCount);

    getRowsCount.$inject = ['$http'];

    function getRowsCount($http) {
        return function (tableName, callback) {
            $http.get('/db/' + tableName + '/rows_count').success(callback);
        }
    }
})();