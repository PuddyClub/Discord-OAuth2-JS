module.exports = function (access_token, type = 'Bearer', user = '@me', version = '') {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}${version}users/${user}`, {
            method: 'GET',
            headers: {
                Authorization: `${type} ${access_token}`,
                'Content-Type': 'application/json'
            }
        }).then(data => {

            // Error Validator
            const result = require('../get/errorValidator')(data);
            if (!result.error) { resolve(result.data); } else { reject(result.error); }

            // Complete
            return;

        }).catch(err => { reject({ code: err.response.status, message: err.message }); return });

        // Complete
        return;

    });
};