module.exports = function (tinyCfg, jsonState, tinyCrypto, type) {

    // Scopes
    let tinyScopeURI = '';

    // Login
    let needRedirect = false;
    if (type === "login" || type === "login_command") {

        // Normal Login
        if (type === "login") { needRedirect = true; }

        // Read Scope
        if (Array.isArray(tinyCfg.discordScope)) {
            for (const item in tinyCfg.discordScope) {
                if (tinyScopeURI) { tinyScopeURI += '%20'; }
                if (tinyCfg.discordScope[item] === "applications.commands.update") { needRedirect = true; }
                tinyScopeURI += encodeURIComponent(tinyCfg.discordScope[item]);
            }
        }

    }

    // Webhook
    else if (type === "webhook") {
        needRedirect = true;
        tinyScopeURI += 'webhook.incoming';
    }

    // Redirect Fixed
    let tinyRedirect = '';
    if (needRedirect && typeof tinyCfg.redirect === "string") {
        tinyRedirect = '&redirect_uri=' + encodeURIComponent(tinyCfg.redirect);
    }

    // State
    let tinyState = '';
    let responseType = '';
    if (needRedirect) {

        // Crypto
        tinyState = require('@tinypudding/puddy-lib/crypto/encrypt')(tinyCrypto, JSON.stringify(jsonState));
        tinyState = '&state=' + encodeURIComponent(tinyState);
        responseType = '&response_type=code';

    }

    // API URL
    const apiURL = require('../config.json').url;

    // Redirect URL
    return `${apiURL}oauth2/authorize?client_id=${encodeURIComponent(tinyCfg.client_id)}&scope=${tinyScopeURI}${responseType}${tinyRedirect}${tinyState}`;

};