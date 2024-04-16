(function () {
    angular
        .module('skillup')
        .factory('parseSkills', parseSkills);

    function parseSkills() {
        /**
         *  Принимает объект, содержащий поле skills и модифицирует этот объект, превращая строку skills в массив объектов
         *  типа {skill_id: int, count: float}, и добавляет needs, если второй параметр true.
         *  Пример строки skills: {"(39,0.387448,t)","(89,1,f)","(44,0.514484,t)","(49,0,)"}
         *
         * @param {object}  obj            Объект, содержащий поле skills
         * @param {boolean} withNeeds      Создавать ли в obj поле needs
         */
        return function(obj, withNeeds) {
            if (!obj.skills) return;
            var re = /"\((\d+),(\d+\.?\d*),?(.)?\)"/g;
            var m;
            var skills = [], needs = [];
            try {
                while ((m = re.exec(obj.skills)) !== null) {
                    if (m.index === re.lastIndex) {
                        re.lastIndex++;
                    }
                    var skill = {skill_id: parseInt(m[1]), count: parseFloat(m[2])};
                    if (withNeeds && m[3] === 't') needs.push(skill);
                    else if (skill.count > 0) skills.push(skill);
                }
                obj.skills = skills;
                if (withNeeds) obj.needs = needs;
            }
            catch (e) { }
        };
    }
})();