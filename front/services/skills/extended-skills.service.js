(function () {
    angular
        .module('skillup')
        .factory('extendedSkills', extendedSkills);

    function extendedSkills() {
        function arrToObj(skillArr) {
            skillArr = angular.copy(skillArr);
            var res = {};
            for (var i = 0; i < skillArr.length; i++) {
                res[skillArr[i].id] = skillArr[i];
                delete res[skillArr[i].id].id;
            }
            return res;
        }

        /**
         * @param skills    Объект, считанный из skills.json
         * @returns {{}|*}  Объект-обертка, содержащий свойства:
         *                      leaves      (array)     спосок ссылок на все листья
         *                      skills      (object)   объект, содержащий все скиллы, как свойства
         *                      root        (object)   ссылка на скилл "Абсолютные знания"
         *                      log()       (function)  выводит в консоль все свойства объекта (для дебага)
         *                  Свойства скилла:
         *                      title       (string)  название скилла
         *                      parents     (array)   список ссылок на родителей
         *                      allParents  (array)   список ссылок на всех родителей вплоть до root
         *                      children    (array)   список ссылок на детей
         *                      allChildren (array)   список ссылок на всех детей вплоть до листьев
         *                      is_leaf      (bool)    является ли листком (может отсутствовать)
         *                      leaves      (array)   список ссылок на листья скилла (только собственные)
         *                      allLeaves   (array)   список ссылок на все листья скилла (рекурсивно по детям)
         *                      id          (string)  id скилла
         */
        return function (skills) {
            if (!skills) return;
            skills = arrToObj(skills);
            this.leaves = []; //хранит ССЫЛКИ (не id) на все листья
            this.skills = {}; //объект, в котором свойствами являются скиллы

            for (var id in skills) {
                //копируем имеющиеся свойства
                this.skills[id] = this.skills[id] || {}; //проверка нужна, потому что дальше объекты могут создаваться
                this.skills[id].title = skills[id].title;
                this.skills[id].parents = []; //хранит ССЫЛКИ (не id) на родителей
                this.skills[id].leaves = this.skills[id].leaves || [];
                this.skills[id].allChildren = [];
                this.skills[id].allParents = [];
                this.skills[id].allLeaves = [];
                this.skills[id].id = id;
                this.skills[id].exp = skills[id].exp;
                this.skills[id].is_leaf = skills[id].is_leaf;

                if (skills[id].parents.length && skills[id].parents[0] == null) skills[id].parents = [];
                for (var i = 0; i < skills[id].parents.length; i++) {
                    this.skills[skills[id].parents[i]] = this.skills[skills[id].parents[i]] || {};
                    if (!_.includes(this.skills[id].parents, this.skills[skills[id].parents[i]]))
                        this.skills[id].parents.push(this.skills[skills[id].parents[i]]);
                }

                for (i = 0; i < this.skills[id].parents.length; i++) {
                    this.skills[id].parents[i].leaves = this.skills[id].parents[i].leaves || [];
                    if (skills[id].is_leaf)
                        if (!_.includes(this.skills[id].parents[i].leaves, this.skills[id]))
                            this.skills[id].parents[i].leaves.push(this.skills[id]);
                }
                if (skills[id].is_leaf) {
                    this.skills[id].is_leaf = skills[id].is_leaf;
                    this.leaves.push(this.skills[id]);
                }

                //создаем массив ССЫЛОК (не id) на детей
                this.skills[id].children = this.skills[id].children || []; //проверка нужна, чтобы children сохранялись
                for (i = 0; i < this.skills[id].parents.length; i++) {
                    this.skills[id].parents[i].children = this.skills[id].parents[i].children || [];
                    if (!_.includes(this.skills[id].parents[i].children, this.skills[id]))
                        this.skills[id].parents[i].children.push(this.skills[id]);
                }
            }

            //рекурсия для добавления всех детей вплоть до листьев и всех листьев
            function addAllChildrenRec(to, from) {
                for (var i = 0; i < from.children.length; i++)
                    if (!_.includes(to.allChildren, from.children[i]))
                        to.allChildren.push(from.children[i]);

                for (i = 0; i < from.leaves.length; i++)
                    if (!_.includes(to.allLeaves, from.leaves[i]))
                        to.allLeaves.push(from.leaves[i]);

                for (var child in from.children) {
                    addAllChildrenRec(to, from.children[child]);
                }
            }

            //рекурсия для добавления всех родителей вплоть до корня
            function addAllParentsRec(to, from) {
                for (var i = 0; i < from.parents.length; i++)
                    if (!_.includes(to.allParents, from.parents[i]))
                        to.allParents.push(from.parents[i]);

                for (var pid in from.parents) {
                    addAllParentsRec(to, from.parents[pid]);
                }
            }

            //добавление ссылок на всех детей и всех родителей
            for (id in this.skills) {
                addAllChildrenRec(this.skills[id], this.skills[id]);
                addAllParentsRec(this.skills[id], this.skills[id]);
            }

            //для дебага
            this.log = function () {
                for (var prop in this) console.log(this[prop]);
            };

            this.root = this.skills['38'];
            //this.skills['root'] = this.root;
            this.root.level = 0;
            this.maxLevel = 0;

            function calculateLevels(skill) {
                for (var i in skill.children) {
                    if (!skill.children[i].level || skill.children[i].level > skill.level + 1)
                        skill.children[i].level = skill.level + 1;
                    calculateLevels(skill.children[i]);
                }
            }

            calculateLevels(this.root);

            for (var i in this.skills) {
                if (this.skills[i].level > this.maxLevel) this.maxLevel = this.skills[i].level;
            }

            function calculateReverseLevels(skill) {
                for (var i in skill.parents) {
                    if (!skill.parents[i].reverseLevel || skill.parents[i].reverseLevel < skill.reverseLevel + 1)
                        skill.parents[i].reverseLevel = skill.reverseLevel + 1;
                    calculateReverseLevels(skill.parents[i]);
                }
            }

            for (var i in this.skills) {
                if (this.skills[i].children.length == 0) {
                    this.skills[i].reverseLevel = 0;
                    calculateReverseLevels(this.skills[i]);
                }
            }

            this.addSkill = function (skill) {
                if (skill) {
                    this.skills[skill.id] = {};
                    this.skills[skill.id].id = skill.id;
                    this.skills[skill.id].title = skill.title;

                    this.skills[skill.id].parents = skill.parents.map(function (el) {
                        return this.skills[el.id];
                    }, this);
                    this.skills[skill.id].parents.forEach(function (el) {
                        el.children.push(this.skills[skill.id]);
                    }, this);

                    this.skills[skill.id].children = skill.children.map(function (el) {
                        return this.skills[el.id];
                    }, this);
                    this.skills[skill.id].children.forEach(function (el) {
                        el.parents.push(this.skills[skill.id]);
                    }, this);

                    this.skills[skill.id].is_leaf = skill.is_leaf;
                    this.skills[skill.id].leaves = this.skills[skill.id].children.filter(function (el) {
                        return el.is_leaf;
                    });

                    if (skill.is_leaf) {
                        this.skills[skill.id].parents.forEach(function (el) {
                            el.leaves.push(this.skills[skill.id]);
                        }, this);
                        this.leaves.push(this.skills[skill.id]);
                    }

                    this.skills[skill.id].allChildren = [];
                    this.skills[skill.id].allParents = [];
                    this.skills[skill.id].allLeaves = [];

                    for (id in this.skills) {
                        addAllChildrenRec(this.skills[id], this.skills[id]);
                        addAllParentsRec(this.skills[id], this.skills[id]);
                    }

                    for (var i in this.skills) {
                        if (this.skills[i].children.length == 0) {
                            this.skills[i].reverseLevel = 0;
                            calculateReverseLevels(this.skills[i]);
                        }
                    }
                    for (var i in this.skills) {
                        this.skills[i].exp = Math.round(Math.exp(this.skills[i].reverseLevel) * 100);
                    }
                }
            };

            this.updateSkill = function (skill) {
                if (skill) {
                    this.deleteSkills(skill.id);
                    this.addSkill(skill);
                }
            };

            this.deleteSkills = function (ids) {
                var skillForDelete;
                if (Array.isArray(ids)) {
                    function deleteSkillFromAllChildren(skill) {
                        if (skill.parents.length) {
                            skill.parents.forEach(function (parent) {
                                var index = parent.allChildren.indexOf(skillForDelete);
                                if (index != -1) parent.allChildren.splice(index, 1);

                                if (skillForDelete.is_leaf) {
                                    index = parent.allLeaves.indexOf(skillForDelete);
                                    if (index != -1) parent.allLeaves.splice(index, 1);
                                }
                                deleteSkillFromAllChildren(parent);
                            })
                        }
                    }

                    function deleteSkillFromAllParents(skill) {
                        if (skill.children.length) {
                            skill.children.forEach(function (child) {
                                var index = child.allParents.indexOf(skillForDelete);
                                if (index != -1) child.allParents.splice(index, 1);
                                deleteSkillFromAllParents(child);
                            })
                        }
                    }

                    ids.forEach(function (id) {
                        skillForDelete = this.skills[id];
                        deleteSkillFromAllChildren(skillForDelete);
                        deleteSkillFromAllParents(skillForDelete);

                        skillForDelete.parents.forEach(function (el) {
                            el.children.splice(el.children.indexOf(skillForDelete), 1);
                        });
                        skillForDelete.children.forEach(function (el) {
                            el.parents.splice(el.parents.indexOf(skillForDelete), 1);
                        });

                        if (skillForDelete.is_leaf) {
                            this.leaves.splice(this.leaves.indexOf(skillForDelete), 1);
                            skillForDelete.parents.forEach(function (el) {
                                el.leaves.splice(el.leaves.indexOf(skillForDelete), 1);
                            });
                        }

                        delete this.skills[id];
                    }, this)
                } else if (Number.isInteger(+ids)) {
                    skillForDelete = this.skills[ids];
                    deleteSkillFromAllChildren(skillForDelete);
                    deleteSkillFromAllParents(skillForDelete);

                    skillForDelete.parents.forEach(function (el) {
                        el.children.splice(el.children.indexOf(skillForDelete), 1);
                    });
                    skillForDelete.children.forEach(function (el) {
                        el.parents.splice(el.parents.indexOf(skillForDelete), 1);
                    });

                    if (skillForDelete.is_leaf) {
                        this.leaves.splice(this.leaves.indexOf(skillForDelete), 1);
                        skillForDelete.parents.forEach(function (el) {
                            el.leaves.splice(el.leaves.indexOf(skillForDelete), 1);
                        });
                    }

                    delete this.skills[ids];
                }
            };
        };
    }
})();