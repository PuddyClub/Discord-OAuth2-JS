module.exports = function (access_token) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`https://discord.com/api/users/@me/guilds`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        }).then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};