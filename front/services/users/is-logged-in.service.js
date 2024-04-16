(function () {
    angular
        .module('skillup')
        .factory('isLoggedIn', isLoggedIn);

    isLoggedIn.$inject = ['$rootScope'];

    function isLoggedIn($rootScope){
        return function() {
            return $rootScope.loggedUser ? true : false;
        };
    }
})();