(function () {
    angular
        .module('skillup')
        .controller('MainController', MainController);

    MainController.$inject = ['$scope', '$http', 'isLoggedIn', '$location', 'parseSkills', 'loggedUser', '$mdToast', '$rootScope',
        'completedSkills', 'skillsToIDs', 'bindToNavtabs', '$mdDialog', 'templates'];

    function MainController($scope, $http, isLoggedIn, $location, parseSkills, loggedUser, $mdToast, $rootScope,
                            completedSkills, skillsToIDs, bindToNavtabs, $mdDialog, templates) {
        $rootScope.pageTitle = 'Главная';
        $scope.registrationPath = "/registration/";
        $scope.reg = {email: '', password: ''};

        $scope.register = function () {
            $scope.registrationPath += 'nick/' + ($scope.reg.nick || '0');
            $scope.registrationPath += '/email/' + ($scope.reg.email || '0');
            $scope.registrationPath += '/password/' + ($scope.reg.password || '0');
            $location.path($scope.registrationPath);
        };

        $scope.showToast = function (msg, parent) {
            parent = parent || '#toastError';
            $mdToast.show(
                $mdToast.simple()
                    .content(msg)
                    .position('bottom left')
                    .hideDelay(3000)
                    .parent(angular.element(document.querySelector(parent)))
            );
        };

        //Следующий блок кода нужен для того, чтобы избежать бага с плейсхолдером пароля
        var count = 0;
        $scope.$watchCollection('reg', function (newVal, oldVal) {
            if (count < 2) {
                $scope.reg.email = '';
                $scope.reg.password = '';
                count++;
            }
        });

        $rootScope.ajaxCall.promise.then(function () {
            if (!isLoggedIn()) return;
            $scope.exs = $rootScope.exs;

            $scope.navtabs = {selected: 0, tabs: ['Решить', 'Проверить', 'Подтвердить']};
            bindToNavtabs($scope, 'navtabs');

            $scope.next = function () {
                if ($scope.navtabs.selected < 2) {
                    $scope.navtabs.selected++;
                }
            };
            $scope.previous = function () {
                if ($scope.navtabs.selected > 0) {
                    $scope.navtabs.selected--;
                }
            };

            $scope.calculateDifficulty = function (tasks, user) {
                var count = 0;
                for (var i in tasks) {
                    count = 0;
                    for (var j in tasks[i].skills) {
                        for (var k in user.skills) {
                            if (tasks[i].skills[j].skill_id === user.skills[k].skill_id) {
                                count += user.skills[k].count < 1 ? user.skills[k].count : 1;
                                break;
                            }
                        }
                    }
                    tasks[i].difficulty = count / tasks[i].skills.length;
                }
            };

            $scope.receiveCallback = function (data) {
                var arr = data.received ? $scope.tasksRecommended : $scope.tasksReceived;
                var arrOther = data.received ? $scope.tasksReceived : $scope.tasksRecommended;
                var index = 0;
                for (var i in arr) {
                    if (arr[i].id === data.id) {
                        index = i;
                        break;
                    }
                }
                var el = arr.splice(index, 1)[0];
                el.expanded = false;
                if (arrOther === $scope.tasksRecommended) {
                    for (var i in $scope.user.skills) {
                        for (var j in el.skills) {
                            if ($scope.user.skills[i].skill_id === el.skills[j]) {
                                arrOther.push(el);
                                return;
                            }
                        }
                    }
                }
                else arrOther.push(el);
            };

            $scope.user = loggedUser();
            $scope.user.completedSkills = completedSkills($scope.user.skills);

            $scope.tasksReceived = [];
            $scope.tasksRecommended = [];
            $scope.solutionsForChecking = [];
            $scope.tasksForApproving = [];

            $scope.loaded = {};
            $scope.isProgressVisible = function() {
                return ($scope.navtabs.selected === 0 && (!$scope.loaded.received || !$scope.loaded.recommended))
                    || ($scope.navtabs.selected === 1 && !$scope.loaded.check) || ($scope.navtabs.selected === 2 && !$scope.loaded.approve);
            };

            $http.post('/db/tasks', {filters: {for_solving: true, received: true}}).success(function (data) {
                for (var i in data) parseSkills(data[i]);
                $scope.tasksReceived = data;
                $scope.calculateDifficulty(data, $scope.user);
                for (var i in $scope.tasksReceived) $scope.tasksReceived[i].received = true;
                $scope.loaded.received = true;
            });

            $http.post('/db/tasks', {
                filters: {for_solving: true, received: false},
                skills: skillsToIDs($scope.user.skills)
            }).success(function (data) {
                for (var i in data) parseSkills(data[i]);
                $scope.tasksRecommended = data;
                $scope.calculateDifficulty(data, $scope.user);
                $scope.loaded.recommended = true;
            });

            $http.post('/db/solutions', {
                filters: {for_checking: true},
                skills: skillsToIDs($scope.user.completedSkills)
            }).success(function (data) {
                for (var i in data) parseSkills(data[i]);
                $scope.solutionsForChecking = data;
                $scope.loaded.check = true;
            });

            $http.post('/db/tasks', {
                filters: {for_approving: true},
                skills: skillsToIDs($scope.user.completedSkills)
            }).success(function (data) {
                for (var i in data) parseSkills(data[i]);
                $scope.tasksForApproving = data;
                $scope.loaded.approve = true;
            });

            $scope.showCreateTaskDialog = function(ev) {
                $mdDialog.show({
                    controller: templates.createTaskDialog.controller,
                    templateUrl: templates.createTaskDialog.templateUrl,
                    targetEvent: ev,
                    locals: {
                        user: $scope.user,
                        showToast: $scope.showToast
                    }
                });
            };
        });
    }
})();
