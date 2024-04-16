(function () {
    angular
        .module('skillup')
        .factory('completedSkills', completedSkills);

    function completedSkills($rootScope) {
        return function (skillsProgress) {
            var res = [];
            for (var i in skillsProgress) {
                if (skillsProgress[i].count >= 1)
                    res.push({skill_id: skillsProgress[i].skill_id, title: $rootScope.exs.skills[skillsProgress[i].skill_id].title,
                        count: skillsProgress[i].count});
            }
            return res;
        };
    }
})();