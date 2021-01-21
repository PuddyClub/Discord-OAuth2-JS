module.exports = function (dsData) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}oauth2/token`,
            {
                method: 'POST',
                body: new URLSearchParams({
                    "client_id": dsData.client_id,
                    "client_secret": dsData.client_secret,
                    "grant_type": 'authorization_code',
                    "code": dsData.code,
                    "redirect_uri": dsData.redirect_uri,
                    "scope": dsData.scope
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(data => {

                // Error Validator
                const result = require('../get/errorValidator')(data);
                if (!result.error) { resolve(result.data); } else { reject(result.error); }

                // Complete
                return;

            }).catch(err => { reject({ code: err.response.status, message: err.message }); return; });

        // Complete
        return;

    });
};