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

            // Error Validator
            const result = require('./errorValidator')(data);
            if (!result.error) { resolve(result.data); } else { reject(result.error); }

            // Complete
            return;

        }).catch(err => { reject({ code: err.response.status, message: err.message }); return });

        // Complete
        return;

    });
};