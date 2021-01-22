module.exports = {

    decipher: function (tinyCrypto, text) {

        // Process
        let result = text;
        const crypto = require('crypto');
        const decipher = crypto.createDecipher(tinyCrypto.algorithm, tinyCrypto.password);
        result = decipher.update(result, 'hex', 'utf8');
        result += decipher.final('utf8');
        result = Buffer.from(result, 'base64').toString();

        // Complete
        return result;

    },

    cipher: function (tinyCrypto, text) {

        // Process
        let result = text;
        const crypto = require('crypto');
        const cipher = crypto.createCipher(tinyCrypto.algorithm, tinyCrypto.password);
        result = cipher.update(Buffer.from(result).toString("base64"), 'utf8', 'hex');
        result += cipher.final('hex');

        // Complete
        return result;

    }

};