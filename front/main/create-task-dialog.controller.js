(function () {
    angular
        .module('skillup')
        .controller('CreateTaskDialogController', CreateTaskDialogController);

    CreateTaskDialogController.$inject = ['$scope', '$rootScope', '$http', '$mdDialog', '$mdSidenav', 'loadLoggedUser', 'user', 'showToast'];

    function CreateTaskDialogController($scope, $rootScope, $http, $mdDialog, $mdSidenav, loadLoggedUser, user, showToast) {
        $scope.user = user;

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $scope.sendTask = {title: '', description: '', links: [], link: '', skills: []};

        $scope.addLink = function () {
            if (!$scope.sendTask.link) {
                showToast('Введите ссылку!');
                return;
            }
            if (_.includes($scope.sendTask.links, $scope.sendTask.link)) {
                showToast('Такая ссылка уже добавлена!');
                return;
            }
            $scope.sendTask.links.push($scope.sendTask.link);
            $scope.sendTask.link = '';
        };

        $scope.removeLink = function (index) {
            $scope.sendTask.links.splice(index, 1);
        };

        $scope.addSkill = function (skill) {
            var s = {skill_id: skill.skill_id, count: 0.5};
            $scope.sendTask.skills.push(s);
            user.completedSkills.splice(user.completedSkills.indexOf(skill), 1);
        };

        $scope.removeSkill = function (skill_id, count) {
            for (var i in $scope.sendTask.skills)
                if ($scope.sendTask.skills[i].skill_id == skill_id) {
                    $scope.sendTask.skills.splice(i, 1);
                    break;
                }
            user.completedSkills.push({skill_id: skill_id, title: $rootScope.exs.skills[skill_id].title});
        };

        $scope.showSidenavSkills = function () {
            $mdSidenav('right').toggle().then(function () {});
        };

        $scope.taskCreated = true;
        $scope.createTask = function () {
            $scope.taskCreated = false;
            if ($scope.sendTask.title.length < 10) {
                $scope.taskCreated = true;
                return;
            }
            if ($scope.sendTask.description.length < 30) {
                $scope.taskCreated = true;
                return;
            }
            if (!$scope.sendTask.skills.length) {
                $scope.taskCreated = true;
                showToast('Прикрепите умения к заданию!');
                return;
            }
            if (!$scope.sendTask.links.length) {
                $scope.taskCreated = true;
                showToast('Добавьте ссылки на учебные материалы!');
                return;
            }
            $http.post('/create_task', $scope.sendTask).success(function (data) {
                $scope.taskCreated = true;
                if (!data) {
                    showToast('Ошибка при создании задания! Попробуйте еще раз...');
                    return;
                }

                loadLoggedUser();
                $mdDialog.cancel();
                showToast('Задание успешно создано!', '#toastSuccess');
            });
        };
    }
})();
