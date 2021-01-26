// Module Base
const discordAuth = {

    // Login
    api: require('./api'),

    // Random Avatar
    randomAvatar: require('./get/randomAvatar'),

    // Login
    login: require('./http/login'),

    // Logout
    logout: require('./http/logout'),

    // Redirect
    redirect: require('./http/redirect'),

    // Refresh Token
    refreshToken: require('./http/refreshToken')

};

// Export Module
module.exports = discordAuth;
