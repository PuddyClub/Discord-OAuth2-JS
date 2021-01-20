module.exports = function (id, access_token) {
    return new Promise(function (resolve, reject) {

        // Response
        require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/v8/interactions/${id}/${access_token}/callback`, {
            method: 'POST',
            body: new URLSearchParams({
                
            }),
        })
            .then(data => { resolve(data); }).catch(err => { reject(err); });

        // Complete
        return;

    });
};