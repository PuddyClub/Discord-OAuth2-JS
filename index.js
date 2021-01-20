// Module Base
const discordAuth = {

    // Login
    api: require('./api'),

    // Login
    login: require('./http/login'),

    // Logout
    logout: require('./http/logout'),

    // Redirect
    redirect: require('./http/redirect')

};

// Export Module
module.exports = discordAuth;
