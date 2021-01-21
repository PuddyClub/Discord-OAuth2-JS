module.exports = function (access_token) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}users/@me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        }).then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};