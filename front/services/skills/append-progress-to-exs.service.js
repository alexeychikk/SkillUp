(function () {
    angular
        .module('skillup')
        .factory('appendProgressToExs', appendProgressToExs);

    appendProgressToExs.$inject = ['$rootScope'];

    function appendProgressToExs($rootScope) {
        return function () {
            var userSkills = $rootScope.loggedUser.skills, userNeeds = $rootScope.loggedUser.needs;
            var skills = $rootScope.exs.skills;
            for (var i in userSkills) {
                skills[userSkills[i].skill_id].count = userSkills[i].count;
            }
            for (var i in userNeeds) {
                skills[userNeeds[i].skill_id].count = userNeeds[i].count;
                skills[userNeeds[i].skill_id].need = true;
            }
        };
    }
})();