(function () {
    angular
        .module('skillup')
        .factory('skillsToIDs', skillsToIDs);

    function skillsToIDs() {
        return function(skillsProgress) {
            var res = [];
            for (var i in skillsProgress) {
                res.push(skillsProgress[i].skill_id);
            }
            return res;
        };
    }
})();