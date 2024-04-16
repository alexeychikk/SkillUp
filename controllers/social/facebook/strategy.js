var getJson = require('../../../lib/get-json');
var requireTree = require('require-tree');
var config = requireTree('../../../config');
var knex = require('knex')(config.get('knex'));
var bcrypt = require('bcryptjs');
var fs = require('fs');
var request = require('request');
var randomstring = require('randomstring');

module.exports = function (token, refreshToken, profile, done) {
    function isValidDate(date) {
        return Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date.getTime());
    }
    /***
     * @return { [{name: String, speciality: String, endYear: Number}] }
     */
    function parseEducation(education) {
        try {
            var res = [];
            for (var i in education) {
                var edi = education[i];
                if (edi.school && edi.school.name) {
                    var ed = {name: edi.school.name};
                    if (edi.concentration && edi.concentration.length && edi.concentration[0].name)
                        ed.speciality = edi.concentration[0].name;
                    if (edi.year && edi.year.name) ed.endYear = +edi.year.name;
                    res.push(ed);
                }
            }
            return res;
        } catch (e) {}
    }
    /***
     * @return { [{company: String, position: String, startDate: Date, endDate: Date}] }
     */
    function parseWork(work) {
        try {
            var res = [];
            for (var i in work) {
                var woi = work[i];
                if (woi.employer && woi.employer.name) {
                    var wo = {company: woi.employer.name};
                    if (woi.position && woi.position.name) wo.position = woi.position.name;
                    if (woi.start_date) {
                        var sd = new Date(woi.start_date);
                        if (isValidDate(sd)) wo.startDate = sd;
                    }
                    if (woi.end_date) {
                        var ed = new Date(woi.end_date);
                        if (isValidDate(ed)) wo.endDate = ed;
                    }
                    res.push(wo);
                }
            }
            return res;
        } catch (e) {}
    }

    process.nextTick(function () {
        knex('users').where('id_facebook', profile.id).then(function (users) {
            var user = users[0];
            var email = profile.emails[0].value.toLowerCase();
            if (user) {
                return done(null, user);
            } else {
                knex('users').where('email', email).then(function (rows) {
                    var emailExists = rows.length != 0;
                    var query = knex('users').returning('*');

                    if (!emailExists) {
                        var options = {
                            host: 'graph.facebook.com',
                            port: 443,
                            path: '/' + profile.id + '?access_token=' + token + '&locale=ru_RU',
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };

                        getJson(options, function (statusCode, result) {
                            var u = {
                                nick: email.split('@')[0],
                                name: profile.displayName,
                                email: email,
                                pswhash: bcrypt.hashSync('facebook'),
                                id_facebook: profile.id
                            };

                            u.avatar = "https://graph.facebook.com/" + profile.id + "/picture" + "?width=9999" + "&access_token=" + token;
                            var avatarName = randomstring.generate() + '.jpg';
                            request(u.avatar)
                                .pipe(fs.createWriteStream(GLOBAL.avatarsDir + avatarName))
                                .on('close', function() {
                                    u.avatar = avatarName;

                                    if (result.birthday) {
                                        var bd = new Date(result.birthday);
                                        if (isValidDate(bd)) u.birthday = bd;
                                    }
                                    if (!u.birthday && profile._json && profile._json.birthday) {
                                        var bd = new Date(profile._json.birthday);
                                        if (isValidDate(bd)) u.birthday = bd;
                                    }

                                    if (result.gender) {
                                        if (result.gender == 'мужской' || result.gender == 'male') u.gender = 'male';
                                        else if (result.gender == 'женский' || result.gender == 'female') u.gender = 'female';
                                    }
                                    if (!u.gender && profile.gender) {
                                        if (profile.gender == 'мужской' || profile.gender == 'male') u.gender = 'male';
                                        else if (profile.gender == 'женский' || profile.gender == 'female') u.gender = 'female';
                                    }

                                    if (result.location && result.location.name) {
                                        var loc = result.location.name.split(', ');
                                        if (loc[0]) u.city = loc[0];
                                        if (loc[1]) u.country = loc[1];
                                    }
                                    if ((!u.city || !u.country) && profile._json && profile._json.location && profile._json.location.name) {
                                        var loc = profile._json.location.name.split(', ');
                                        if (!u.city && loc[0]) u.city = loc[0];
                                        if (!u.country && loc[1]) u.country = loc[1];
                                        //TODO: заменить этот костыльный перевод на что-то нормальное (или просто убрать)
                                        if (u.country == 'Ukraine') u.country = 'Украина';
                                        else if (u.country == 'Russia') u.country = 'Россия';
                                    }

                                    if (result.education) {
                                        var edu = parseEducation(result.education);
                                        if (edu && edu.length) u.education = JSON.stringify(edu);
                                    }
                                    if (!u.education && profile._json && profile._json.education) {
                                        var edu = parseEducation(profile._json.education);
                                        if (edu && edu.length) u.education = JSON.stringify(edu);
                                    }

                                    if (result.work) {
                                        var wor = parseWork(result.work);
                                        if (wor && wor.length) u.work = JSON.stringify(wor);
                                    }
                                    if (!u.work && profile._json && profile._json.work) {
                                        var wor = parseWork(profile._json.work);
                                        if (wor && wor.length) u.work = JSON.stringify(wor);
                                    }

                                    query.insert(u).then(function (user) {
                                        return done(null, user[0], {message: 'first'});
                                    }).catch(function (err) {
                                        done(err);
                                    });
                                });
                        });
                    }
                    else {
                        query.update({id_facebook: profile.id}).where('email', email).then(function (user) {
                            return done(null, user[0]);
                        }).catch(function (err) {
                            done(err);
                        });
                    }
                });
            }
        }).catch(function (err) {
            done(err);
        });
    });
};