var fs = require('fs');

module.exports = function (req, res, next) {
    if (req.isAuthenticated()) {
        var filename = GLOBAL.avatarsDir + req.path;
        fs.exists(filename, function (exists) {
            if (exists) {
                res.sendFile(filename);
            } else {
                res.end();
            }
        });
    }
    else res.end();
};