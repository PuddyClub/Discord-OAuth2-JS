module.exports = function (guildID) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/guilds/${guildID}/widget.json`,
            {
                method: 'GET'
            }
        ).then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};