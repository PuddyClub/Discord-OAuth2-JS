module.exports = function (id, access_token) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}v8/interactions/${id}/${access_token}/callback`, {
            method: 'POST',
            body: new URLSearchParams({

            }),
            'Content-Type': 'application/json'
        })
            .then(data => { resolve(data); return; }).catch(err => { reject({ code: err.response.status, message: err.message }); return; });

        // Complete
        return;

    });
};