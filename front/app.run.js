(function () {
    angular
        .module('skillup')
        .run(run);

    run.$inject = ['$rootScope', '$http', 'loadLoggedUser', '$q', 'isLoggedIn', '$location', 'updateExs', 'notifications'];

    function run($rootScope, $http, loadLoggedUser, $q, isLoggedIn, $location, updateExs, notifications) {
        $rootScope.ajaxCall = $q.defer();
        $rootScope.isLoggedIn = isLoggedIn;
        $rootScope.sidenavVisible = true;
        $rootScope.navtabs = {selected: 0, tabs: []};

        if ($location.path().indexOf('registration') > -1) $rootScope.ajaxCall.resolve();
        else loadLoggedUser(function(user) {
            if (user) {
                notifications.getCount();
                notifications.startListening();
                $http.get('db/skills').success(function (data) {
                    if (data) {
                        updateExs(data);
                    }
                    $rootScope.ajaxCall.resolve();
                });
            } else $rootScope.ajaxCall.resolve();
        });

        function setPageNum(obj, newVal, oldVal) {
            if ((new RegExp('/main')).test(newVal)) $rootScope.selectedPageNum = 0;
            else if ((new RegExp('/skills')).test(newVal)) $rootScope.selectedPageNum = 1;
            else if ((new RegExp('/tasks')).test(newVal)) $rootScope.selectedPageNum = 2;
            else if ((new RegExp('/users')).test(newVal)) {
                if (newVal.split('/').pop() == $rootScope.loggedUser.id) $rootScope.selectedPageNum = 4;
                else $rootScope.selectedPageNum = 3;
            }
            else if ((new RegExp('/competences')).test(newVal)) $rootScope.selectedPageNum = 5;
            else if ((new RegExp('/admin')).test(newVal)) $rootScope.selectedPageNum = -1;
        }

        $rootScope.ajaxCall.promise.then(function () {
            setPageNum(null, $location.path());
            $rootScope.$on('$locationChangeSuccess', setPageNum);
        });
    }
})();