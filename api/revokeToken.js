module.exports = function (dsData) {
    return new Promise(function (resolve, reject) {

        console.log(dsData);

        // Response
        require('@tinypudding/puddy-lib/http/fetch/text')(`https://discord.com/api/oauth2/token/revoke`, {
            method: 'POST',
            body: new URLSearchParams({ 
                client_id: dsData.client_id, 
                access_token: dsData.access_token 
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};