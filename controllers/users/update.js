var bcrypt = require('bcryptjs');
var fs = require('fs');

module.exports = function (knex) {
    return function (req, res, next) {
        var newAvatar = req.file && req.file.path;
        if (!req.isAuthenticated()) {
            if (newAvatar && fs.existsSync(newAvatar)) fs.unlink(newAvatar);
            return res.end();
        }
        var u = {};
        if (req.body.name) u.name = req.body.name;
        if (req.body.birthday) u.birthday = new Date(req.body.birthday);
        if (req.body.gender) u.gender = req.body.gender;
        if (req.body.country !== undefined) u.country = req.body.country;
        if (req.body.city !== undefined) u.city = req.body.city;
        if (req.body.education !== undefined) u.education = req.body.education;
        if (req.body.work !== undefined) u.work = req.body.work;

        var oldAvatar = req.user.avatar;
        if (newAvatar) u.avatar = req.file.filename;

        knex('users').where('id', req.user.id).update(u).then(function(){
            if (newAvatar && oldAvatar) if (fs.existsSync(GLOBAL.avatarsDir + oldAvatar)) fs.unlink(GLOBAL.avatarsDir + oldAvatar);
            res.end('ok');
        }).catch(function (err) {
            if (newAvatar && fs.existsSync(newAvatar)) fs.unlink(newAvatar);
            console.log(err);
            res.end();
        });
    };
};