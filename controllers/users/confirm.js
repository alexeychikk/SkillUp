
var bcrypt = require('bcryptjs');

module.exports = function (cryptoWrap, knex) {
    return function (req, res, next) {
        if (req.query.s === cryptoWrap.decrypt(req.query.cs)) {
            var u = {
                email: cryptoWrap.decrypt(req.query.cem),
                nick: cryptoWrap.decrypt(req.query.cni),
                name: cryptoWrap.decrypt(req.query.cna),
                pswhash: bcrypt.hashSync(cryptoWrap.decrypt(req.query.cpa))
            };

            knex('users').insert(u).returning('*')
                .then(function (user) {
                    req.logIn(user[0], function (err) {
                        return err
                            ? next(err)
                            : res.redirect('/registration/step2');
                    });
                }).catch(function (err) {
                    res.end();
                    next(err);
                });
        }
        else res.end();
    };
};