
module.exports = function (cryptoWrap, transporter, randomstring) {
    return function (req, res, next) {
        if (!req.body.email || !req.body.nick || !req.body.name || !req.body.password) return res.end();
        req.body.email = req.body.email.toLowerCase();
        var str = randomstring.generate();
        var link = "http://" + req.get('host') + "/confirm?s=" + str
            + "&cs=" + cryptoWrap.encrypt(str)
            + "&cem=" + cryptoWrap.encrypt(req.body.email)
            + "&cni=" + cryptoWrap.encrypt(req.body.nick)
            + "&cna=" + cryptoWrap.encrypt(req.body.name)
            + "&cpa=" + cryptoWrap.encrypt(req.body.password);

        var mailOptions = {
            to: req.body.email,
            subject: "Подтвердите регистрацию на SkillUP",
            html: "Здравствуйте!<br>Перейдите по ссылке, чтобы подтвердить регистрацию.<br><a href=" + link + ">ПОДТВЕРДИТЬ</a>"
        };
        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                res.end();
            } else {
                res.end('ok');
            }
        });
    };
};