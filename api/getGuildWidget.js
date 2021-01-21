module.exports = function (guildID) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}guilds/${encodeURIComponent(guildID)}/widget.json`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};