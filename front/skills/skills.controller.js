(function () {
    angular
        .module('skillup')
        .controller('SkillsController', SkillsController);

    SkillsController.$inject = ['$scope', '$rootScope', '$location', 'isLoggedIn', '$timeout', 'editNeed', '$mdDialog',
        'templates'];

    function SkillsController($scope, $rootScope, $location, isLoggedIn, $timeout, editNeed, $mdDialog, templates) {
        $rootScope.ajaxCall.promise.then(function () {
            if (!isLoggedIn()) { $location.path('/main'); return; }

            $rootScope.pageTitle = 'Умения';
            $rootScope.navtabs = {};//TODO: забиндить какие-нибудь табсы

            //Определяеться в каком виде выводятся скиллы (графа или дерева)
            $scope.viewLike = 'graph';
            $scope.skillsLoadCounter = 0;

            $scope.currentSkill = $rootScope.exs.root;
            $scope.skills = $rootScope.exs.skills;
            //Объект в котором сохраняются id скиллов, которые надо добавить в needs
            $scope.dataNeeds = {needs: []};
            //Объект для поиска скилла по названию
            $scope.query = {};

            $scope.isOpened = false;

            $scope.openAddingDialog = function (ev) {
                dialogFactory(ev, templates.addSkillDialog.templateUrl, templates.addSkillDialog.controller,
                    {dialog: 'add', currentSkill: null});
            };

            $scope.openDeletingDialog = function (ev) {
                dialogFactory(ev, templates.deleteSkillDialog.templateUrl, templates.deleteSkillDialog.controller,
                    {dialog: 'delete', currentSkill: $scope.currentSkill.id != $rootScope.exs.root.id ? $scope.currentSkill : null});
            };

            $scope.openUpdatingDialog = function (ev) {
                dialogFactory(ev, templates.updateSkillDialog.templateUrl, templates.updateSkillDialog.controller,
                    {dialog: 'update', currentSkill: $scope.currentSkill.id != $rootScope.exs.root.id ? $scope.currentSkill : null});
            };

            function dialogFactory(event, templateUrl, controller, locals) {
                $mdDialog.show({
                    controller: controller,
                    templateUrl: templateUrl,
                    parent: angular.element(document.body),
                    targetEvent: event,
                    autoWrap: false,
                    clickOutsideToClose: true,
                    locals: locals,
                    bindToController: false,
                    onRemoving: function () {
                        $scope.skills = $rootScope.exs.skills;
                        $scope.currentSkill = $scope.skills[$scope.currentSkill.id] || $rootScope.exs.root;
                    }
                });
            }

            //Функция для поиска совпадений в названиях скиллов с введенным текстом
            //Возвращает массив подходящих скиллов
            $scope.query.search = function (text) {
                var lowercaseQuery = angular.lowercase(text);
                var filteredSkills = [];
                for (var id in $scope.skills) {
                    if ($scope.skills[id].title.toLowerCase().indexOf(lowercaseQuery) !== -1) {
                        filteredSkills.push($scope.skills[id]);
                    }
                }
                return filteredSkills;
            };

            $scope.expandParents = function (skill) {
                if (skill.parents.length) skill.parents[0].expanded = true;
                else return;
                $scope.expandParents(skill.parents[0]);
            };

            //Делает выбраный в autocomplete скилл текущим в виде графа или прокручивает до скила в виде дерева
            $scope.query.selectedItemChanged = function (skill) {
                if (skill)
                    if ($scope.viewLike === 'graph') {
                        $scope.currentSkill = skill;
                    } else {
                        $scope.collapseTree();
                        $scope.expandAll.disabled = false;
                        $scope.expandParents($scope.skills[skill.id]);
                        $scope.highlightedSkillID = skill.id;
                    }
            };

            //Делает выбраный скилл текущим (по нажатию на скилл)
            $scope.setToCurrent = function (skill) {
                if ($scope.addClicked) $scope.addClicked = false;
                else $scope.currentSkill = skill;
            };

            //Чтобы при нажатии на плюс или крест не устанавливался currentSkill
            $scope.addClicked = false;

            //Добавляе нидс
            $scope.addNeed = function (id) {
                if ($scope.currentSkill.id != id) $scope.addClicked = true;
                $scope.editNeed(id, false);
            };

            //Убираем нидс
            $scope.removeNeed = function (id) {
                if ($scope.currentSkill.id != id) $scope.addClicked = true;
                $scope.editNeed(id, true);
            };

            //Добавить или убрать скилл из нидсов текущего юзера
            $scope.editNeed = editNeed;

            $scope.expandAll = {};
            $scope.expandAll.visible = false;
            $scope.expandAll.disabled = true;

            $scope.highlight = {};
            $scope.highlight.skills = true;
            $scope.highlight.needs = true;

            $rootScope.exs.root.expanded = true;

            $scope.setExpandedAllDisabled = function () {
                if (!$rootScope.exs.root.expanded) {
                    $scope.expandAll.disabled = true;
                    return;
                }
                for (var skill in $rootScope.exs.root.children) {
                    if ($rootScope.exs.root.children[skill].expanded) {
                        $scope.expandAll.disabled = false;
                        return;
                    }
                }
                $scope.expandAll.disabled = true;
            };

            $scope.collapseTree = function () {
                for (var skill in $scope.skills) {
                    $scope.skills[skill].expanded = false;
                }
                $rootScope.exs.root.expanded = true;
                $scope.expandAll.disabled = true;
            };

            $scope.expand = function (skill) {
                skill.expanded = !skill.expanded;
                if (!skill.expanded) $scope.setExpandedAllDisabled();
                else $scope.expandAll.disabled = false;
            };

            $scope.getSkillType = function (skill) {
                if (skill.need) return $scope.highlight.needs ? 'need' : null;
                if (skill.count) return $scope.highlight.skills ? 'skill' : null;
            };

            $scope.changeView = function () {
                if($scope.viewLike === 'graph') $scope.viewLike = 'tree';
                else $scope.viewLike = 'graph';
                $scope.expandAll.visible = !$scope.expandAll.visible;
            };

            //TODO: Сделать в директиве
            $timeout(function () {
                document.getElementById('secondary-toolbar-actions').style.opacity = 1;
            });
        });
    }
})();