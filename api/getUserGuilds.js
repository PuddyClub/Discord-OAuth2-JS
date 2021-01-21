module.exports = function (access_token) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}users/@me/guilds`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        }).then(data => {

            // OBJ Type
            const objType = require('@tinypudding/puddy-lib/get/objType');

            // Success
            if (data(data, 'object') && (typeof data.message !== "string" || data.message !== "401: Unauthorized")) {
                resolve(data);
            }

            // Complete
            return;

        }).catch(err => { reject({ code: err.response.status, message: err.message }); return });

        // Complete
        return;

    });
};