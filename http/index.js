// Module Base
const getItems = {

    // Login
    'login': require('./login'),

    // Logout
    'logout': require('./logout'),

    // Redirect
    'redirect': require('./redirect'),

    // Refresh Token
    'refreshToken': require('./refreshToken')

};

// Send Module
module.exports = getItems;