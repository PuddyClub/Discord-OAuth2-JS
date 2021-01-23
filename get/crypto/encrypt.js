module.exports = function (tinyCrypto, text) {

    let iv = crypto.randomBytes(tinyCrypto.IV_LENGTH);
    let cipher = crypto.createCipheriv(tinyCrypto.algorithm, Buffer.from(tinyCrypto.password), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');

};