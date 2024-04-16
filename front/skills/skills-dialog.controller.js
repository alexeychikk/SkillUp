(function () {
    angular
        .module('skillup')
        .controller('SkillsDialogController', SkillsDialogController);

    SkillsDialogController.$inject = ['$scope', '$mdDialog', '$mdToast', '$http', '$rootScope', 'appendProgressToExs',
        'loadLoggedUser', 'dialog', 'currentSkill'];

    function SkillsDialogController($scope, $mdDialog, $mdToast, $http, $rootScope, appendProgressToExs, loadLoggedUser,
                                    dialog, currentSkill) {
        ($scope.init = function() {
            $scope.allChildren = $rootScope.exs.root.allChildren;
            $scope.allParents = [$rootScope.exs.root].concat($scope.allChildren);
            $scope.skills = $rootScope.exs.skills;

            $scope.chips = $scope.chips || {};
            $scope.chips.allChildrenNames = [];
            for (var index in $scope.allChildren) {
                $scope.chips.allChildrenNames.push({
                    id: $scope.allChildren[index].id,
                    title: $scope.allChildren[index].title
                });
            }
            $scope.chips.allParentsNames = [{
                id: $rootScope.exs.root.id,
                title: $rootScope.exs.root.title
            }].concat($scope.chips.allChildrenNames);
        })();

        if (dialog === 'add' || dialog === 'update') {
            $scope.adding = {};
            $scope.chips.selectedParents = [];
            if (dialog === 'add')
                $scope.chips.selectedParents.push({
                    id: $rootScope.exs.root.id,
                    title: $rootScope.exs.root.title
                });
            $scope.chips.selectedParent = null;
            $scope.chips.searchParentTitle = '';

            $scope.chips.selectedChildren = [];
            $scope.chips.selectedChild = null;
            $scope.chips.searchChildTitle = '';

            function checkForRecursiveNesting(skill) {
                if (skill.parents && skill.parents.length || skill.children && skill.children.length) {
                    if (!children) {
                        var children = [];
                        function allChildren(obj) {
                            if (!_.includes(children, obj)) children.push(obj);
                            if (obj.children && obj.children.length)
                                obj.children.forEach(function (el) {
                                    allChildren(el);
                                })
                        }
                        skill.children.forEach(function (el) {
                            allChildren($scope.skills[el.id]);
                        });
                    }

                    var res;
                    for (var obj in skill.parents) {
                        var el = skill.parents[obj];
                        if (!_.includes(children, $scope.skills[el.id])) {
                            res = checkForRecursiveNesting($scope.skills[el.id]) ? el.title : false;
                            if (res) break;
                        }
                        else return el.title;
                    }
                    return res;
                }
                else return false;
            }

            function existFilter(title) {
                return function checkForExist(skill) {
                    return angular.lowercase(skill.title) === angular.lowercase(title);
                };
            }
        }

        if (dialog === 'update') {
            $scope.updated = {};
            $scope.chips.selectedSkill = currentSkill;

            $scope.selectedItemChanged = function (id) {
                if (id) {
                    for (var index in $scope.skills[id].parents) {
                        $scope.chips.selectedParents
                            .push({
                                id: $scope.skills[id].parents[index].id,
                                title: $scope.skills[id].parents[index].title
                            });
                    }
                    for (var index in $scope.skills[id].children) {
                        $scope.chips.selectedChildren
                            .push({
                                id: $scope.skills[id].children[index].id,
                                title: $scope.skills[id].children[index].title
                            });
                    }
                    if ($scope.chips.selectedSkill) $scope.updated.title = $scope.chips.selectedSkill.title;
                    else if (currentSkill) $scope.updated.title = currentSkill.title;
                } else {
                    $scope.chips.selectedParents = [];
                    $scope.chips.selectedChildren = [];
                    $scope.updated.title = '';
                }
            };

            currentSkill && $scope.selectedItemChanged(currentSkill.id);
        }

        if (dialog === 'delete' || dialog === 'update' && currentSkill) {
            $scope.chips.selectedSkillsForDeleting = [currentSkill];
            $scope.chips.searchSkillTitle = '';
        } else if(dialog === 'delete' || dialog === 'update') {
            $scope.chips.selectedSkillsForDeleting = [];
            $scope.chips.selectedSkill = null;
            $scope.chips.searchSkillTitle = '';
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.querySearch = function (query, array) {
            return query ? array.filter(createFilterFor(query)) : [];
        };
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            return function filterFn(skill) {
                if ($scope.chips.selectedSkill && skill.id == $scope.chips.selectedSkill.id) return false;
                return angular.lowercase(skill.title).indexOf(angular.lowercase(query)) !== -1;
            };
        }

        $scope.confirm = function () {
            if (dialog === 'add' && $scope.adding.title) {
                if (!!$scope.allParents.filter(existFilter($scope.adding.title)).length) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Умение с таким именем уже существует')
                            .hideDelay(2000)
                    );
                    return;
                }

                if ($scope.chips.selectedChildren.length) {
                    for (var index in $scope.chips.selectedParents) {
                        var title = $scope.chips.selectedParents[index].title;
                        if ($scope.chips.selectedChildren.filter(existFilter(title)).length) {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('В родительских и дочерних умениях не должно быть совпадений')
                                    .hideDelay(2000)
                            );
                            return;
                        }
                    }
                }

                var newSkill = {
                    title: $scope.adding.title,
                    parents: $scope.chips.selectedParents.length ? $scope.chips.selectedParents : [{id: $rootScope.exs.root.id}],
                    children: $scope.chips.selectedChildren
                };
                var res = checkForRecursiveNesting(newSkill);
                if (res) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Рекурсивная вложеность! Умение "' + res +
                            '" не должно содержатся в родительских и дочерних умениях одновременно')
                            .hideDelay(3000)
                    );
                    return;
                }

                $http.post('/add_skill', {skill: newSkill}).success(function (data) {
                    if (data != 'error') {
                        newSkill.id = data;
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Умение успешно добавлено')
                                .hideDelay(2000)
                        );
                        //обновляем переменные
                        $rootScope.exs.addSkill(newSkill);
                        $scope.adding.title = '';
                        $scope.chips.selectedParents = [];
                        $scope.chips.selectedParent = null;
                        $scope.chips.searchParentTitle = '';
                        $scope.chips.selectedChildren = [];
                        $scope.chips.selectedChild = null;
                        $scope.chips.searchChildTitle = '';
                        updateSkills();
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('При добавлении умения произошла ошибка')
                                .hideDelay(2000)
                        );
                    }
                });
            }

            if (dialog === 'update' && $scope.chips.selectedSkill) {
                var skill = $scope.skills[$scope.chips.selectedSkill.id];

                //Проверка были ли внесены изменения
                if ($scope.updated.title === $scope.chips.selectedSkill.title) {
                    if (skill.parents.length == $scope.chips.selectedParents.length) {
                        var temp;
                        for (var obj in skill.parents) {
                            temp = false;
                            for (var obj1 in $scope.chips.selectedParents) {
                                if (skill.parents[obj].id == $scope.chips.selectedParents[obj1].id) temp = true;
                            }
                            if (!temp) break;
                        }
                        if (temp && skill.children.length == $scope.chips.selectedChildren.length) {
                            for (var obj in skill.children) {
                                temp = false;
                                for (var obj1 in $scope.chips.selectedChildren) {
                                    if (skill.children[obj].id == $scope.chips.selectedChildren[obj1].id) temp = true;
                                }
                                if (!temp) break;
                            }
                            if (temp) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .textContent('Нет изменений для сохранения')
                                        .hideDelay(2000)
                                );
                                return;
                            }
                        }
                    }
                } else {
                    if (!$scope.updated.title) return;
                    else if (!!$scope.allParents.filter(existFilter($scope.updated.title)).length) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Умение с таким именем уже существует')
                                .hideDelay(2000)
                        );
                        return;
                    }
                }

                //Проверка изменилось ли что-нибудь в родительских умениях
                var parentsForInsert, id = $scope.chips.selectedSkill.id;
                if ($scope.chips.selectedParents.length == $scope.skills[id].parents.length) {
                    for (var index in $scope.chips.selectedParents) {
                        var pTitle = $scope.chips.selectedParents[index].title;
                        if (!$scope.skills[id].parents.filter(existFilter(pTitle)).length) {
                            parentsForInsert = [];
                        }
                    }
                    if (!parentsForInsert) parentsForInsert = null; //null - значит, что ничего не изменилось
                }

                if (parentsForInsert !== null)
                    parentsForInsert = $scope.chips.selectedParents.length
                        ? $scope.chips.selectedParents.map(function (el) {
                        return {skill_id: id, parent_id: el.id};
                    })
                        //Если родительские умения не были выбраны, то родителем будет корневое умение
                        : [{skill_id: id, parent_id: $rootScope.exs.root.id}];

                //Проверка изменилось ли что-нибудь в дочерних умениях
                var childrenForInsert;
                if ($scope.chips.selectedChildren.length == $scope.skills[id].children.length) {
                    for (var index in $scope.chips.selectedChildren) {
                        var cTitle = $scope.chips.selectedChildren[index].title;
                        if (!$scope.skills[id].children.filter(existFilter(cTitle)).length) {
                            childrenForInsert = [];
                        }
                    }
                    if (!childrenForInsert) childrenForInsert = null; //null - значит, что ничего не изменилось
                }

                if (childrenForInsert !== null)
                    childrenForInsert = $scope.chips.selectedChildren.map(function (el) {
                        return {skill_id: el.id, parent_id: id};
                    });

                var updatedSkill = {
                    id: id,
                    title: $scope.updated.title,
                    parents: parentsForInsert,
                    children: childrenForInsert
                };

                var updatedSkillForExsUpdate = {
                    id: id,
                    title: $scope.updated.title,
                    parents: $scope.chips.selectedParents.length
                        ? $scope.chips.selectedParents
                        : [{id: $rootScope.exs.root.id, title: $rootScope.exs.root.title}],
                    children: $scope.chips.selectedChildren
                };

                var res = checkForRecursiveNesting(updatedSkillForExsUpdate);
                if (res) {
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Рекурсивная вложеность! Умение "' + res +
                            '" не должно содержатся в родительских и дочерних умениях одновременно')
                            .hideDelay(3000)
                    );
                    return;
                }

                $http.post('/update_skill', {skill: updatedSkill}).success(function (data) {
                    if (data == 'ok') {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Умения успешно обновлены')
                                .hideDelay(2000)
                        );
                        //обновляем переменные
                        $rootScope.exs.updateSkill(updatedSkillForExsUpdate);
                        updateSkills();
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('При обновлении умений произошла ошибка')
                                .hideDelay(2000)
                        );
                    }
                });
            }

            if (dialog === 'delete' && $scope.chips.selectedSkillsForDeleting.length) {
                var ids = $scope.chips.selectedSkillsForDeleting.map(function (el) {
                    return el.id;
                });

                function checkChildrenForDelete(skill) {
                    skill.children.forEach(function (el) {
                        var trigger;
                        for (var obj2 in el.parents) {
                            var parent = el.parents[obj2];
                            if (!_.includes(ids, parent.id)){
                                trigger = false;
                                break;
                            } else trigger = true;
                        }
                        if (trigger) ids.push(el.id);
                        checkChildrenForDelete(el);
                    })
                }

                $scope.chips.selectedSkillsForDeleting.forEach(function (skill) {
                    if (!_.includes(ids, skill.id))
                        checkChildrenForDelete($scope.skills[skill.id]);
                });

                $http.post('/delete_skill', {skills: ids})
                    .success(function (data) {
                        if (data == 'ok') {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Умения успешно удалены')
                                    .hideDelay(2000)
                            );
                            $rootScope.exs.deleteSkills(ids);
                            updateSkills();
                            $mdDialog.hide();
                        } else {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('При удалении умений произошла ошибка')
                                    .hideDelay(2000)
                            );
                        }
                    });
            } else if (dialog === 'delete') {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Вы не выбрали умений для удаления')
                        .hideDelay(2000)
                );
            }
        };

        function updateSkills() {
            loadLoggedUser(function(user) {
                if (user) {
                    appendProgressToExs();
                    $scope.init();
                }
            });
        }
    }
})();
