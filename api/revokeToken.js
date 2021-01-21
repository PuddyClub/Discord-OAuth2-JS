module.exports = function (tinySession, tinyAuth) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;
        const credentials = require('../get/credentials')(tinyAuth);

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}oauth2/token/revoke`, {
            method: 'POST',
            body: new URLSearchParams({
                "token": tinySession.access_token
            }),
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(data => { resolve(data); return; }).catch(err => { reject({ code: err.response.status, message: err.message }); return; });

        // Complete
        return;

    });
};