(function () {
    angular
        .module('skillup')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['$scope', '$http', '$location', '$rootScope', '$timeout', 'extendedSkills',
        'loadLoggedUser', '$mdDialog', 'loggedUser', 'appendProgressToExs', 'bindToNavtabs', 'templates', 'notifications'];

    function NavbarController($scope, $http, $location, $rootScope, $timeout, extendedSkills, loadLoggedUser, $mdDialog,
                              loggedUser, appendProgressToExs, bindToNavtabs, templates, notifications) {

        //!!! ОСТОРОЖНО !!!
        //ДАЛЬНЕЙШИЙ КОД МОЖЕТ НАНЕСТИ ВАШЕЙ ПСИХИКЕ НЕПОПРАВИМЫЙ УЩЕРБ
        function setTabsMargin() {
            var el = document.getElementById('navtabs');
            if (el && el.children[0] && el.children[0].children[1] && el.children[0].children[1].children[0]) {
                var navtabs = el.children[0].children[1].children[0];
                if (navtabs.offsetWidth > window.innerWidth || navtabs.offsetWidth < 30) $timeout(setTabsMargin, 10);
                else {
                    navtabs.style.marginLeft = 'calc((100vw - ' + navtabs.offsetWidth + 'px) / 2)';
                    document.getElementById('navtabs').style.opacity = 1;
                }
            }
        }

        $timeout(setTabsMargin, 10);
        $scope.navtabs = {selected: 0, tabs: []};
        $rootScope.$watch('navtabs', function (newValue, oldValue) {
            var el = document.getElementById('navtabs');
            el.style.opacity = 0;
            $timeout(function () {
                $scope.navtabs = newValue;
                el.style.opacity = 1;
                $timeout(setTabsMargin, 10);
            }, 200);
        });
        bindToNavtabs($scope, 'navtabs');
        //СДЕСЬ МОЖЕТЕ СНОВА ОТКРЫТЬ ГЛАЗА

        $scope.date = new Date();

        $scope.loginErr = {loginerr: false};

        $scope.toggleSidenav = function () {
            $rootScope.sidenavVisible = !$rootScope.sidenavVisible;
        };

        $scope.getSelectedPageNum = function () {
            return $rootScope.selectedPageNum;
        };

        $scope.loggedUser = loggedUser;

        $rootScope.$watch('loginData', function (newVal) {
            if (newVal) $scope.login(newVal.email, newVal.password);
        });

        $scope.login = function (email, password) {
            $http.post('/login', {email: email, password: password})
                .success(function (data) {
                    if (!data) {
                        $rootScope.loginErr = {loginerr: true};
                        $timeout(function () {
                            $rootScope.loginErr = {loginerr: false};
                        }, 3000);
                        return;
                    }
                    loadLoggedUser(function (user) {
                        if (user) {
                            $http.get('db/skills').success(function (skills) {
                                if (skills) {
                                    $rootScope.exs = new extendedSkills(skills);
                                    appendProgressToExs();
                                    $rootScope.ajaxCall.resolve();
                                    $mdDialog.hide();
                                    $location.path('/main'); //фикс, если логинишься со своей страницы, а не с главной
                                    $timeout(function () {
                                        $location.path(data);
                                    }, 1);
                                }
                            });
                        }
                    });
                });
        };

        $scope.showLoginDialog = function (ev) {
            $mdDialog.show({
                controller: templates.loginDialog.controller,
                templateUrl: templates.loginDialog.templateUrl,
                targetEvent: ev
            });
        };

        $scope.logout = function () {
            $http.get('/logout').success(function (data) {
                loadLoggedUser(function () {
                    $location.path('/main');
                });
            });
        };

        $scope.notifications = notifications;

        $scope.notificationsShown = false;

        $scope.openNotifications = function(ev) {
            $mdDialog.show({
                controller: templates.notifications.controller,
                templateUrl: templates.notifications.templateUrl,
                targetEvent: ev,
                hasBackdrop: false,
                clickOutsideToClose: true,
                autoWrap: false,
                onShowing: function() { $scope.notificationsShown = true; },
                onRemoving: function() { $scope.notificationsShown = false; }
            });
        };
    }
})();
