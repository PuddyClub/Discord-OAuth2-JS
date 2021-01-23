// IV Length
const IV_LENGTH = 16;

// Module
module.exports = {

    encrypt: function (tinyCrypto, text) {

        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv(tinyCrypto.algorithm, Buffer.from(tinyCrypto.password), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');

    },

    decrypt: function (tinyCrypto, text) {

        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(tinyCrypto.algorithm, Buffer.from(tinyCrypto.password), iv);
        let decrypted = decipher.update(encryptedText);
       
        decrypted = Buffer.concat([decrypted, decipher.final()]);
       
        return decrypted.toString();

    }

};