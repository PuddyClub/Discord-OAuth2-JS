module.exports = function (dsData) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`https://discord.com/api/oauth2/token`,
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
            }).then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};