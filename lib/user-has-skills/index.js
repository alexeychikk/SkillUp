
module.exports = function (userSkills, skills) {
    if (!userSkills || userSkills.length === 0) {
        console.log('User doesnt have those skill!');
        return false;
    }
    var found = false;
    var i = null, j = null;
    var temp = null;
    for (i in skills) {
        found = false;
        for (j in userSkills) {
            if (skills[i].skill_id == userSkills[j].skill_id) {
                temp = userSkills[j];
                found = true;
                break;
            }
        }
        if (found) {
            if (temp.count < 1) {
                console.log('Not enough level of skill!');
                return false;
            }
        }
        else {
            console.log('User doesnt have those skill!');
            return false;
        }
    }
    return true;
};