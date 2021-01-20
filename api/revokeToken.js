module.exports = function (dsData) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`https://discord.com/api/oauth2/token/revoke?token=${dsData.access_token}`, {
            method: 'POST',
            body: new URLSearchParams({ "client_id": dsData.client_id }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};