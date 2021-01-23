module.exports = function (tinyCrypto, text) {

    const crypto = require('crypto');
    let iv = crypto.randomBytes(tinyCrypto.IV_LENGTH);
    let cipher = crypto.createCipheriv(tinyCrypto.algorithm, Buffer.from(tinyCrypto.key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');

};