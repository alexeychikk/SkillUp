(function () {
    angular
        .module('skillup')
        .factory('loggedUser', loggedUser);

    loggedUser.$inject = ['$rootScope'];

    function loggedUser($rootScope) {
        return function() {
            return $rootScope.loggedUser;
        };
    }
})();