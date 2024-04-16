(function () {
    angular
        .module('skillup')
        .directive('skupTasksList', skupTasksList);

    skupTasksList.$inject = ['templates'];

    function skupTasksList(templates) {
        return {
            restrict: 'E',
            templateUrl: templates.tasksList.templateUrl,
            scope: {
                tasks: '=',
                exs: '=?',
                showDifficulty: '=?',
                showExpand: '=?',
                solvable: '=?',
                approvable: '=?',
                showExp: '=?',
                expStyle: '@?',
                showSkills: '=?',
                send: '=?',
                callback: '=?',
                solution: '=?',
                showLike: '=?',
                showReceive: '=?',
                approve: '=?',
                approveCallback: '=?',
                subheader: '@?',
                receiveCallback: '=?'
            },
            controller: TasksListController
        }
    }

    TasksListController.$inject = ['$http', '$scope', '$mdToast', 'loadLoggedUser', '$rootScope'];

    function TasksListController($http, $scope, $mdToast, loadLoggedUser, $rootScope) {

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

        $scope.apprData = {title_correct: true, skills_correct: true, desc_correct: true, links_correct: true};
        $scope.exs = $scope.exs || $rootScope.exs;
        if ($scope.showDifficulty === undefined) $scope.showDifficulty = true;
        if ($scope.showExpand === undefined) $scope.showExpand = true;
        if ($scope.solvable === undefined) $scope.solvable = true;
        if ($scope.showExp === undefined) $scope.showExp = true;
        if ($scope.showSkills === undefined) $scope.showSkills = true;
        if ($scope.showLike === undefined) $scope.showLike = true;
        if ($scope.showReceive === undefined) $scope.showReceive = true;
        if ($scope.solution === undefined) $scope.solution = {preview: false, text: ''};

        if ($scope.callback === undefined) $scope.callback = function (data, id) {
            if (!data) $scope.showToast('Не удалось отправить решение...');
            else {
                loadLoggedUser(function() {
                    $scope.showToast('Решение отправлено!', '#toastSuccess');
                    $scope.solution.text = '';
                    var index = 0;
                    for (var i in $scope.tasks) {
                        if ($scope.tasks[i].id === id) {
                            index = i;
                            break;
                        }
                    }
                    $scope.tasks.splice(index, 1);
                });
            }
        };

        if ($scope.send === undefined) $scope.send = function (id) {
            if ($scope.solution.text.length < 1) {
                return;
            }
            $http.post('/solve_task', {task_id: $scope.lastExpandedTask.id, content: $scope.solution.text})
                .success(function(data) { $scope.callback(data, id); });
        };

        if ($scope.approveCallback === undefined) $scope.approveCallback = function (data, id) {
            if (!data) $scope.showToast('Не удалось отправить подтверждение...');
            else {
                loadLoggedUser(function() {
                    $scope.showToast('Подтверждение отправлено!', '#toastSuccess');
                    var index = 0;
                    for (var i in $scope.tasks) {
                        if ($scope.tasks[i].id === id) {
                            index = i;
                            break;
                        }
                    }
                    $scope.tasks.splice(index, 1);
                });
            }
        };

        if ($scope.approve === undefined) $scope.approve = function (id) {
            var data = angular.copy($scope.apprData);
            data.task_id = id;
            $http.post('/approve_task', data).success(function(data) { $scope.approveCallback(data, id); });
        };

        $scope.$watchCollection('tasks', function(newVal, oldVal) {
            try {
                $scope.lastExpandedTask = $scope.tasks[0];
                if (!$scope.lastExpandedTask) return;
                $scope.lastExpandedTask.expanded = false;
            } catch (e) {}
        });

        $scope.expand = function (task) {
            if ($scope.lastExpandedTask !== task) $scope.lastExpandedTask.expanded = false;
            task.expanded = !task.expanded;
            $scope.lastExpandedTask = task;
        };
    }
})();