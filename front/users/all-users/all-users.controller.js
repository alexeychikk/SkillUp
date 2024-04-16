(function () {
    angular
        .module('skillup')
        .controller('AllUsersController', AllUsersController);

    AllUsersController.$inject = ['$scope', '$location', '$rootScope', 'parseSkills', 'isLoggedIn', 'bindToNavtabs',
        'skillsToIDs', 'ScrollLoader'];

    function AllUsersController($scope, $location, $rootScope, parseSkills, isLoggedIn, bindToNavtabs, skillsToIDs, ScrollLoader) {
        $rootScope.ajaxCall.promise.then(function () {
            if (!isLoggedIn()) { $location.path('/main'); return; }
            $rootScope.pageTitle = 'Пользователи';
            $scope.navtabs = {selected: 0, tabs: ['Рекомендуемые', 'Подписки', 'Подписчики']};
            bindToNavtabs($scope, 'navtabs');
            $scope.username = "";

            $scope.users = [];
            $scope.onUsersLoaded = function (data) {
                for (var i in data) {
                    parseSkills(data[i], true);
                }
                $scope.users = $scope.users.concat(data);
            };

            var interests = skillsToIDs($rootScope.loggedUser.skills).concat(skillsToIDs($rootScope.loggedUser.needs));
            $scope.scrollLoader = ScrollLoader($scope, {
                events: 'indexPageScrolled',
                method: 'post',
                url: 'db/users',
                body: {skills: interests, without_self: true},
                onLoadEnd: $scope.onUsersLoaded
            });

            $scope.scrollLoader.loadMoreData();

            $scope.goToUserPage = function(id) {
                if (!$scope.cardActionClicked) $location.path('/users/' + id);
                else $scope.cardActionClicked = false;
            };

            $scope.expand = function (user) {
                if (!$scope.lastExpandedUser) $scope.lastExpandedUser = user;
                if ($scope.lastExpandedUser !== user) $scope.lastExpandedUser.expanded = false;
                user.expanded = !user.expanded;
                $scope.lastExpandedUser = user;
                $scope.cardActionClicked = true;
            };

            $scope.$watch('username', function () {
                if ($scope.lastExpandedUser) $scope.lastExpandedUser.expanded = false;
            });
        });
    }
})();