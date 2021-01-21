module.exports = function (bot_token, data) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}guilds/${encodeURIComponent(data.guild_id)}/members/${encodeURIComponent(data.user_id)}`, {
            method: 'PUT',
            body: new URLSearchParams({
                deaf: data.deaf,
                mute: data.mute,
                nick: data.nickname,
                roles: data.roles,
                access_token: data.access_token,
            }),
            headers: {
                'Authorization': `Bot ${bot_token}`,
                'Content-Type': 'application/json'
            }
        }).then(data => {

            // Error Validator
            const result = require('./errorValidator')(data);
            if (!result.error) { resolve(result.data); } else { reject(result.error); }

            // Complete
            return;

        }).catch(err => { reject({ code: err.response.status, message: err.message }); return; });

        // Complete
        return;

    });
};