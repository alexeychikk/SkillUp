var _ = require('lodash');

function arrToObj(skillArr) {
    var res = {};
    for (var i = 0; i < skillArr.length; i++) {
        res[skillArr[i].id] = skillArr[i];
        delete res[skillArr[i].id].id;
    }
    return res;
}

module.exports = function (skills) {
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

        if (skills[id].parents.length && skills[id].parents[0] == null) skills[id].parents = [];
        for (var i = 0; i < skills[id].parents.length; i++) {
            this.skills[skills[id].parents[i]] = this.skills[skills[id].parents[i]] || {};
            if (!_.includes(this.skills[id].parents, this.skills[skills[id].parents[i]]))
                this.skills[id].parents.push(this.skills[skills[id].parents[i]]);
        }

        for (i = 0; i < this.skills[id].parents.length; i++) {
            this.skills[id].parents[i].leaves = this.skills[id].parents[i].leaves || [];
            if (skills[id].isLeaf)
                if (!_.includes(this.skills[id].parents[i].leaves, this.skills[id]))
                    this.skills[id].parents[i].leaves.push(this.skills[id]);
        }
        if (skills[id].isLeaf) {
            this.skills[id].isLeaf = skills[id].isLeaf;
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

        for (var chid in from.children) {
            addAllChildrenRec(to, from.children[chid]);
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

    /*for (var i in this.skills) {
     this.skills[i].exp = Math.round(Math.exp(this.maxLevel - this.skills[i].level) * 100);
     }*/

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

    for (var i in this.skills) {
        this.skills[i].exp = Math.round(Math.exp(this.skills[i].reverseLevel) * 100);
    }
};