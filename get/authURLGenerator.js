module.exports = function (tinyCfg, jsonState, tinyCrypto, type) {

    // Redirect Fixed
    let tinyRedirect = '';
    if (type !== "login_command") {
        if (typeof tinyCfg.redirect === "string") {
            tinyRedirect = '&redirect_uri=' + encodeURIComponent(tinyCfg.redirect);
        }
    }

    // Crypto
    let tinyState = require('@tinypudding/puddy-lib/crypto/encrypt')(tinyCrypto, JSON.stringify(jsonState));
    tinyState = encodeURIComponent(tinyState);

    // Scopes
    let tinyScopeURI = '';

    // Login
    if (type === "login" || type === "login_command") {
        if (Array.isArray(tinyCfg.discordScope)) {
            for (const item in tinyCfg.discordScope) {
                if (tinyScopeURI) {
                    tinyScopeURI += '%20';
                }
                tinyScopeURI += encodeURIComponent(tinyCfg.discordScope[item]);
            }
        }
    }

    // Webhook
    else if (type === "webhook") {
        tinyScopeURI += 'webhook.incoming';
    }

    // API URL
    const apiURL = require('../config.json').url;

    // Redirect URL
    return `${apiURL}oauth2/authorize?client_id=${encodeURIComponent(tinyCfg.client_id)}&scope=${tinyScopeURI}&response_type=code${tinyRedirect}&state=${tinyState}`;

};