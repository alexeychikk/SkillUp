(function () {
    angular
        .module('skillup')
        .factory('loadLoggedUser', loadLoggedUser);

    loadLoggedUser.$inject = ['$rootScope', '$http', 'parseSkills'];

    function loadLoggedUser($rootScope, $http, parseSkills) {
        return function(callback) {
            $http.get('/logged_user').success(function (data) {
                $rootScope.loggedUser = data[0];
                if ($rootScope.loggedUser) {
                    parseSkills($rootScope.loggedUser, true);
                    if ($rootScope.loggedUser.birthday) $rootScope.loggedUser.birthday = new Date($rootScope.loggedUser.birthday);
                    try {
                        $rootScope.loggedUser.education = JSON.parse($rootScope.loggedUser.education);
                    } catch (e) {}
                    try {
                        $rootScope.loggedUser.work = JSON.parse($rootScope.loggedUser.work);
                    } catch (e) {}

                    for (var i in $rootScope.loggedUser.education) {
                        if ($rootScope.loggedUser.education[i].startYear)
                            $rootScope.loggedUser.education[i].startYear = +$rootScope.loggedUser.education[i].startYear;
                        if ($rootScope.loggedUser.education[i].endYear)
                            $rootScope.loggedUser.education[i].endYear = +$rootScope.loggedUser.education[i].endYear;
                    }

                    for (var i in $rootScope.loggedUser.work) {
                        if (typeof $rootScope.loggedUser.work[i].startDate == "string")
                            $rootScope.loggedUser.work[i].startDate = new Date($rootScope.loggedUser.work[i].startDate);
                        if (typeof $rootScope.loggedUser.work[i].endDate == "string")
                            $rootScope.loggedUser.work[i].endDate = new Date($rootScope.loggedUser.work[i].endDate);
                    }
                }
                callback && callback($rootScope.loggedUser);
            });
        };
    }
})();