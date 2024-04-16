var crypto = require('crypto');

module.exports = function (options) {
    return {
        algorithm: options.algorithm, password: options.password,

        encrypt: function (text, key) {
            var cipher = crypto.createCipher(this.algorithm, key || this.password);
            var crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
        },

        decrypt: function (text, key) {
            var decipher = crypto.createDecipher(this.algorithm, key || this.password);
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        }
    };
};