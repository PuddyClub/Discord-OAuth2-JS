module.exports = {

    // Get Token
    getToken: async function (dsData) {

        // Response
        const fetch = require('node-fetch');
        const response = await fetch(`https://discord.com/api/oauth2/token`,
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
            });

        // Get Data
        let data = {
            data: null,
            error: null
        };

        // Try
        try {
            data.data = await response.json();
        } catch (err) {
            data.data = null;
            data.error = err;
        }

        // Return
        return data;

    },

    // Get User
    getUser: async function (access_token) {

        // Response
        const fetch = require('node-fetch');
        const response = await fetch(`https://discord.com/api/users/@me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        });

        // Get Data
        let data = {
            data: null,
            error: null
        };

        // Try
        try {
            data.data = await response.json();
        } catch (err) {
            data.data = null;
            data.error = err;
        }

        // Return
        return data;

    },

    // Revoke Token
    revokeToken: async function (access_token) {

        // Response
        const fetch = require('node-fetch');
        const response = await fetch(`https://discord.com/api/oauth2/token/revoke?token=${access_token}`,
            {
                method: 'POST'
            }
        );

        // Get Data
        let data = {
            data: null,
            error: null
        };

        // Try
        try {
            data.data = await response.json();
        } catch (err) {
            data.data = null;
            data.error = err;
        }

        // Return
        return data;

    },

    // User Guilds
    getUserGuilds: async function (access_token) {

        // Response
        const fetch = require('node-fetch');
        const response = await fetch(`https://discord.com/api/users/@me/guilds`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            }
        });

        // Get Data
        let data = {
            data: null,
            error: null
        };

        // Try
        try {
            data.data = await response.json();
        } catch (err) {
            data.data = null;
            data.error = err;
        }

        // Return
        return data;

    },

    // Guild Widget
    getGuildWidget: async function (guildID) {

        // Response
        const fetch = require('node-fetch');
        const response = await fetch(`https://discord.com/api/guilds/${guildID}/widget.json`,
            {
                method: 'GET'
            }
        );

        // Get Data
        let data = {
            data: null,
            error: null
        };

        // Try
        try {
            data.data = await response.json();
        } catch (err) {
            data.data = null;
            data.error = err;
        }

        // Return
        return data;

    },

};