(function () {
    angular
        .module('skillup')
        .directive('skupSolutionsList', skupSolutionsList);

    skupSolutionsList.$inject = ['templates'];

    function skupSolutionsList(templates) {
        return {
            restrict: 'E',
            templateUrl: templates.solutionsList.templateUrl,
            scope: {
                solutions: '=',
                exs: '=?',
                showExpand: '=?',
                showExp: '=?',
                expStyle: '@?',
                showSkills: '=?',
                send: '=?',
                callback: '=?',
                showLike: '=?',
                showCheck: '=?',
                check: '=?',
                subheader: '@?'
            },
            controller: SolutionsListController
        }
    }

    SolutionsListController.$inject = ['$http', '$scope', '$mdToast', 'loadLoggedUser', '$rootScope'];

    function SolutionsListController($http, $scope, $mdToast, loadLoggedUser, $rootScope) {

        $scope.showToast = function (msg, parent, position, delay) {
            parent = parent || '#toastError';
            position = position || 'bottom left';
            delay = delay || 3000;
            $mdToast.show(
                $mdToast.simple()
                    .content(msg)
                    .position(position)
                    .hideDelay(delay)
                    .parent(angular.element(document.querySelector(parent)))
            );
        };

        $scope.exs = $scope.exs || $rootScope.exs;
        if ($scope.showExpand === undefined) $scope.showExpand = true;
        if ($scope.showExp === undefined) $scope.showExp = true;
        if ($scope.showSkills === undefined) $scope.showSkills = true;
        if ($scope.showLike === undefined) $scope.showLike = true;
        if ($scope.showCheck === undefined) $scope.showCheck = true;

        if ($scope.send === undefined) $scope.send = function (solution) {
            if (solution.isCorrect === undefined) {
                $scope.showToast('Вы не проверили решение!', null, 'bottom right');
                return;
            }
            $http.post('/check_solution', {
                solution_id: solution.id,
                is_correct: solution.isCorrect,
                rating: $scope.stars.count
            }).success(function(data) { $scope.callback(data, solution.id); });
        };

        if ($scope.callback === undefined) $scope.callback = function (data, id) {
            if (!data) $scope.showToast('Не удалось отправить результат...');
            else {
                loadLoggedUser(function() {
                    $scope.showToast('Решение проверено!', '#toastSuccess');
                    var index = 0;
                    for (var i in $scope.solutions) {
                        if ($scope.solutions[i].id === id) {
                            index = i;
                            break;
                        }
                    }
                    $scope.solutions.splice(index, 1);
                });
            }
        };

        if ($scope.check === undefined) $scope.check = function (solution, isCorrect) {
            solution.isCorrect = isCorrect;
            $scope.starsFixed = false;
            $scope.stars = {s1: true, s2: true, s3: true, s4: true, s5: true, count: 5};
        };

        $scope.mouseEnterStar = function (num) {
            if ($scope.starsFixed) return;
            for (var i = 1; i <= 5; i++) {
                $scope.stars['s' + i] = i <= num;
            }
            $scope.stars.count = num;
        };

        $scope.mouseLeaveStar = function (num) {
            if ($scope.starsFixed) return;
            if (!num) {
                $scope.stars = {s1: false, s2: false, s3: false, s4: false, s5: false};
                return;
            }
            $scope.stars['s' + num] = false;
            $scope.stars.count = 1;
        };

        $scope.star = function (num) {
            $scope.starsFixed = !($scope.stars.count === num) || !$scope.starsFixed;
            $scope.stars.count = num;
            for (var i = 1; i <= 5; i++) {
                $scope.stars['s' + i] = i <= num;
            }
        };

        $scope.$watch('solutions', function(newVal, oldVal) {
            try {
                $scope.lastExpandedSolution = $scope.solutions[0];
                if (!$scope.lastExpandedSolution) return;
                $scope.lastExpandedSolution.expanded = false;
            } catch (e) {}
        });

        $scope.expand = function (solution) {
            if ($scope.lastExpandedSolution !== solution) $scope.lastExpandedSolution.expanded = false;
            solution.expanded = !solution.expanded;
            $scope.lastExpandedSolution = solution;
        };
    }
})();