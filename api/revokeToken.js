module.exports = function (access_token) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/oauth2/token/revoke?token=${access_token}`, { method: 'POST' })
            .then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};