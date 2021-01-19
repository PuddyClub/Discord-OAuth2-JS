module.exports = {

    // Get Token
    getToken: function (dsData) {
        return new Promise(function (resolve, reject) {

            // Response
            require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/oauth2/token`,
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
    },

    // Get User
    getUser: function (access_token) {
        return new Promise(function (resolve, reject) {

            // Response
            require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/users/@me`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            }).then(data => { resolve(data); }).catch(err => { reject(err); });

            // Complete
            return;

        });
    },

    // Revoke Token
    revokeToken: function (access_token) {
        return new Promise(function (resolve, reject) {

            // Response
            require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/oauth2/token/revoke?token=${access_token}`, { method: 'POST' })
                .then(data => { resolve(data); }).catch(err => { reject(err); });

            // Complete
            return;

        });
    },

    // User Guilds
    getUserGuilds: function (access_token) {
        return new Promise(function (resolve, reject) {

            // Response
            require('@tinypudding/puddy-lib/http/fetchJSON')(`https://discord.com/api/users/@me/guilds`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            }).then(data => { resolve(data); }).catch(err => { reject(err); });

            // Complete
            return;

        });
    },

    // Guild Widget
    getGuildWidget: function (guildID) {
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
    },

};