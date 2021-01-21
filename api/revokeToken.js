module.exports = function (tinySession, tinyAuth) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;
        const credentials = require('../get/credentials')(tinyAuth);

        // Response
        require('@tinypudding/puddy-lib/http/fetch/text')(`${apiURL}oauth2/token/revoke?token=${encodeURIComponent(tinySession.access_token)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};