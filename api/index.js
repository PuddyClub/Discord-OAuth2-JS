// Module Base
const discord_api = {

    // Get Token
    getToken: require('./getToken'),

    // Get User
    getUser: require('./getUser'),

    // Revoke Token
    revokeToken: require('./revokeToken'),

    // User Guilds
    getUserGuilds: require('./getUserGuilds'),

    // Guild Widget
    getGuildWidget: require('./getGuildWidget'),

};

// Send Module
module.exports = discord_api;