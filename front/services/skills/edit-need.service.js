(function () {
    angular
        .module('skillup')
        .factory('editNeed', editNeed);

    function editNeed($http, $rootScope) {
        return function (id, remove, callback) {
            $http.post('/needs', {remove: remove, needs: [id]}).success(function (data) {
                var userNeeds = $rootScope.loggedUser.needs;
                var userSkills = $rootScope.loggedUser.skills;
                if (data == 'added') {
                    $rootScope.exs.skills[id].need = true;
                    if ($rootScope.exs.skills[id].count === undefined) $rootScope.exs.skills[id].count = 0;
                    userNeeds.push({skill_id: +id, count: $rootScope.exs.skills[id].count});
                    userSkills.splice(userSkills.findIndex(function (el) {
                        return el.skill_id == id;
                    }), 1);
                }
                else if (data == 'removed') {
                    $rootScope.exs.skills[id].need = false;
                    if ($rootScope.exs.skills[id].count === 0) delete $rootScope.exs.skills[id].count;
                    else userSkills.push({skill_id: +id, count: $rootScope.exs.skills[id].count});
                    userNeeds.splice(userNeeds.findIndex(function (el) {
                        return el.skill_id == id;
                    }), 1);
                }
                callback && callback();
            });
        };
    }
})();