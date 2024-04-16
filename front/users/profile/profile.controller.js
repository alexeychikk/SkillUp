(function () {
    angular
        .module('skillup')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$scope', '$routeParams', '$http', '$mdDialog', 'editNeed', 'loggedUser', 'parseSkills',
        '$rootScope', 'bindToNavtabs', 'isLoggedIn', '$location', 'templates'];

    function ProfileController($scope, $routeParams, $http, $mdDialog, editNeed, loggedUser, parseSkills, $rootScope,
                               bindToNavtabs, isLoggedIn, $location, templates) {
        $rootScope.ajaxCall.promise.then(function () {
            if (!isLoggedIn()) { $location.path('/main'); return; }
            $scope.tabSelected = 0;

            $scope.findSkill = function (id) {
                return $scope.exs.skills[id];
            };

            $scope.exs = $rootScope.exs;

            var dbUsersOptions = {id: $routeParams.user_id};

            $scope.loadProfile = function (data) {
                if (!data) $scope.user = loggedUser();
                else {
                    $scope.user = data[0];
                    if ($scope.user) parseSkills($scope.user, true);
                }
                if (!$scope.user) {
                    $rootScope.pageTitle = 'Пользователи';
                    return;
                }
                $rootScope.pageTitle = $scope.user.name;
                $scope.navtabs = {selected: 0, tabs: ['Умения', 'Задания', 'Информация']};
                bindToNavtabs($scope, 'navtabs');
                $scope.ownProfile = (loggedUser().id === $scope.user.id);

                if ($scope.user.birthday) $scope.user.birthday = new Date($scope.user.birthday);

                if ($scope.user.education) {
                    try {
                        if (angular.isString($scope.user.education)) $scope.user.education = JSON.parse($scope.user.education);
                    } catch (e) {}
                }
                if ($scope.user.work) {
                    try {
                        if (angular.isString($scope.user.work)) $scope.user.work = JSON.parse($scope.user.work);
                    } catch (e) {}
                }

                for (var i in $scope.user.education) {
                    if ($scope.user.education[i].startYear)
                        $scope.user.education[i].startYear = +$scope.user.education[i].startYear;
                    if ($scope.user.education[i].endYear)
                        $scope.user.education[i].endYear = +$scope.user.education[i].endYear;
                }

                for (var i in $scope.user.work) {
                    if (typeof $scope.user.work[i].startDate == "string")
                        $scope.user.work[i].startDate = new Date($scope.user.work[i].startDate);
                    if (typeof $scope.user.work[i].endDate == "string")
                        $scope.user.work[i].endDate = new Date($scope.user.work[i].endDate);
                }

                $scope.userLoaded = true;

                $scope.info = {
                    editing: {},
                    birthday: new Date($scope.user.birthday),
                    country: $scope.user.country,
                    city: $scope.user.city,
                    education: angular.copy($scope.user.education),
                    work: angular.copy($scope.user.work)
                };

                $scope.editInfo = function(param) {
                    if (param === 'general') {
                        $scope.info.gender = $scope.user.gender;
                        $scope.info.birthday = new Date($scope.user.birthday);
                    }
                    else if (param === 'location') {
                        $scope.info.country = $scope.user.country;
                        $scope.info.city = $scope.user.city;
                    }
                    else if (param === 'education') {
                        $scope.info.education = angular.copy($scope.user.education);
                    }
                    else if (param === 'work') {
                        $scope.info.work = angular.copy($scope.user.work);
                    }
                    $scope.info.editing[param] = true;
                };

                $scope.cancelEdit = function(param) {
                    $scope.info.editing[param] = false;
                };

                $scope.updateProfile = function(param) {
                    var updateData = {};
                    if (param === 'general') {
                        if ($scope.user.birthday.getTime() != $scope.info.birthday.getTime())
                            updateData.birthday = $scope.info.birthday;
                        if ($scope.user.gender != $scope.info.gender) updateData.gender = $scope.info.gender;
                    }
                    else if (param === 'location') {
                        if ($scope.user.country != $scope.info.country) updateData.country = $scope.info.country;
                        if ($scope.user.city != $scope.info.city) updateData.city = $scope.info.city;
                    }
                    else if (param === 'education') {
                        for (var i in $scope.info.education) {
                            if (!$scope.info.education[i].name) $scope.info.education.splice(i, 1);
                        }
                        if (!angular.equals($scope.user.education, $scope.info.education))
                            updateData.education = JSON.stringify($scope.info.education);
                    }
                    else if (param === 'work') {
                        for (var i in $scope.info.work) {
                            if (!$scope.info.work[i].company) $scope.info.work.splice(i, 1);
                        }
                        if (!angular.equals($scope.user.work, $scope.info.work))
                            updateData.work = JSON.stringify($scope.info.work);
                    }
                    if (!Object.keys(updateData).length) {
                        $scope.info.editing[param] = false;
                        return;
                    }
                    $http.post('/update_profile', updateData).success(function(res) {
                        if (!res) {
                        }
                        else {
                            if (param === 'general') {
                                $scope.user.birthday = $scope.info.birthday;
                                $scope.user.gender = $scope.info.gender;
                            }
                            else if (param === 'location') {
                                $scope.user.country = $scope.info.country;
                                $scope.user.city = $scope.info.city;
                            }
                            else if (param === 'education') {
                                $scope.user.education = $scope.info.education;
                            }
                            else if (param === 'work') {
                                $scope.user.work = $scope.info.work;
                            }
                            $scope.info.editing[param] = false;
                        }
                    });
                };

                $scope.maxYear = (new Date()).getFullYear();
                $scope.minYear = $scope.maxYear - 100;

                $scope.addEducation = function () {
                    $scope.info.education.unshift({});
                };

                $scope.removeEducation = function (index) {
                    $scope.info.education.splice(index, 1);
                };

                $scope.addWork = function () {
                    $scope.info.work.unshift({});
                };

                $scope.removeWork = function (index) {
                    $scope.info.work.splice(index, 1);
                };

                $scope.addNeed = function (id) {
                    $scope.editNeed(id, false);
                };

                $scope.removeNeed = function (id) {
                    $scope.editNeed(id, true);
                };

                $scope.editNeed = editNeed;

                $scope.showAddInfoDialog = function(ev) {
                    $mdDialog.show({
                        controller: templates.addUserInfoDialog.controller,
                        templateUrl: templates.addUserInfoDialog.templateUrl,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: { user: $scope.user }
                    }).then(function(answer) {
                        if (answer) {
                            $scope.info.editing[answer] = true;
                            if (answer == 'education') $scope.info.education.push({});
                            else if (answer == 'work') $scope.info.work.push({});
                        }
                    });
                };

                //$scope.scrollLoader = ScrollLoader({url: 'db/tasks'});
                //TODO: добавить подгрузку заданий, переделать то что ниже
                if ($scope.user.tasks_done) {
                    var dbTasksDoneOptions = {ids: $scope.user.tasks_done};
                    $http.post('/db/tasks', dbTasksDoneOptions).success(function (tasksDone) {
                        $scope.tasksDone = tasksDone;
                        if ($scope.ownProfile) for (var i in $scope.tasksDone) $scope.tasksDone[i].notReceivable = true;
                        else {
/*                            setNotReceivable($scope.tasksDone, loggedUser().tasks_created, true);
                            setNotReceivable($scope.tasksDone, loggedUser().tasks_done, true);*/
                        }
                        dbTasksDoneOptions.offset = $scope.tasksDone.length;
                    });
                }

                if ($scope.user.solutions_checked) {
                    var dbSolutionsCheckedOptions = {ids: $scope.user.solutions_checked};
                    $http.post('/db/solutions', dbSolutionsCheckedOptions).success(function (solutionsChecked) {
                        $scope.solutionsChecked = solutionsChecked;
                    });
                }

                if ($scope.user.tasks_approved) {
                    var dbTasksApprovedOptions = {ids: $scope.user.tasks_approved};
                    $http.post('/db/tasks', dbTasksApprovedOptions).success(function (tasksApproved) {
                        $scope.tasksApproved = tasksApproved;
                        for (var i in $scope.tasksApproved) {
                            if (!$scope.tasksApproved[i].is_approved) {
                                $scope.tasksApproved[i].notReceivable = true;
                                continue;
                            }
                            if (loggedUser().tasks_created && loggedUser().tasks_created.indexOf($scope.tasksApproved[i].id) !== -1) {
                                $scope.tasksApproved[i].notReceivable = true;
                                continue;
                            }
                            if (loggedUser().tasks_done && loggedUser().tasks_done.indexOf($scope.tasksApproved[i].id) !== -1) {
                                $scope.tasksApproved[i].notReceivable = true;
                            }
                        }
                    });
                }

                if ($scope.user.tasks_created) {
                    var dbTasksCreatedOptions = {ids: $scope.user.tasks_created};
                    $http.post('/db/tasks', dbTasksCreatedOptions).success(function (tasksCreated) {
                        $scope.tasksCreated = tasksCreated;
                        if (!$scope.ownProfile) {
                            /*setNotReceivable($scope.tasksCreated, loggedUser().tasks_done, true);*/
                        }
                        else for (var i in $scope.tasksCreated) $scope.tasksCreated[i].notReceivable = true;
                    });
                }
            };

            if (!loggedUser()) return;
            if (loggedUser().id != $routeParams.user_id)
                $http.post('/db/users', dbUsersOptions).success($scope.loadProfile);
            else $scope.loadProfile();
        });
    }
})();
