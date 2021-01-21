module.exports = function (guildID) {
    return new Promise(function (resolve, reject) {

        // API URL
        const apiURL = require('../config.json').url;

        // Response
        require('@tinypudding/puddy-lib/http/fetch/json')(`${apiURL}guilds/${guildID}/widget.json`,
            {
                method: 'GET'
            }
        ).then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};