(function () {
    angular
        .module('skillup')
        .controller('OneTaskController', OneTaskController);

    OneTaskController.$inject = ['$scope', '$routeParams', '$http', 'parseSkills', '$rootScope', '$location', 'isLoggedIn',
        'getEndingVariant', '$mdToast'];

    function OneTaskController($scope, $routeParams, $http, parseSkills, $rootScope, $location, isLoggedIn,
                               getEndingVariant, $mdToast) {
        $rootScope.sidenavVisible = false;

        $scope.getEndingVariant = getEndingVariant;
        $scope.solvedTextVariants = ['решил', 'решили', 'решило'];
        $scope.solvingTextVariants = ['решает', 'решают', 'решают'];

        $rootScope.ajaxCall.promise.then(function () {
            if (!isLoggedIn()) { $location.path('/main'); return; }
            $scope.exs = $rootScope.exs;
            $rootScope.navtabs = {};//TODO: забиндить какие-нибудь табсы
            $scope.currentTask = {};
            $scope.solution = {};
            $scope.solution.preview = false;

            $http.post('/db/tasks', {id: $routeParams.task_id, solutionsCount: true}).success(function (rows) {
                $scope.currentTask = rows[0];
                parseSkills($scope.currentTask);

                $http.post('/db/users', {id: $scope.currentTask.author}).success(function (rows) {
                    $scope.author = rows[0];
                });
            });

            $scope.solution.showPreview = function () {
                $scope.solution.preview = !$scope.solution.preview;
            };

            $scope.solution.sendSolution = function (taskID, text) {
                if (!text || !text.length) {
                    return;
                }
                $http.post('/solve_task', {id: taskID, content: text}).success(function (data) {
                    if (data == 'ok')
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Решение успешно отправлено')
                                .hideDelay(2000)
                        );
                    //TODO: Где пользователь сможет посмотреть, как продвигается проверка его решения?
                    else
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('При отправке решения произошла ошибка')
                                .hideDelay(2000)
                        );
                })
            };
        });
    }
})();