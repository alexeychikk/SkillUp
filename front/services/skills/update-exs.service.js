(function () {
    angular
        .module('skillup')
        .factory('updateExs', updateExs);

    function updateExs($rootScope, extendedSkills, appendProgressToExs) {
        return function (data) {
            $rootScope.exs = new extendedSkills(data);
            appendProgressToExs();
        };
    }
})();