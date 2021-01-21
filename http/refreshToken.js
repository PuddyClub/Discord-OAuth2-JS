
module.exports = async function (req, res, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Modules
        const _ = require('lodash');
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // Detect Config
        if (objType(req[type], 'object')) {

            // Detect Config
            if (objType(cfg, 'object')) {

                // Create Settings
                const tinyCfg = _.defaultsDeep({}, cfg.auth, {
                    redirect: 'http://localhost/redirect',
                    discordScope: [],
                    client_id: '',
                    client_secret: ''
                });

                // Prepare Redirect
                let redirect_value = '/';
                if (typeof cfg.redirect === "string") {
                    if (cfg.redirect.startsWith('/')) {
                        redirect_value = cfg.redirect.substring(1);
                    } else {
                        redirect_value = cfg.redirect;
                    }
                }

                // Check Session
                if (typeof tinyCfg.csrfToken !== "string" || tinyCfg.csrfToken.length < 1 || (typeof req[type].csrfToken === "string" && req[type].csrfToken === tinyCfg.csrfToken)) {

                    // Result
                    const result = { refreshed: false };

                    // Exist Session
                    if (existSession) {

                        if (
                            (typeof cfg.refresh_token === "string" && cfg.refresh_token.length > 0) ||
                            (typeof cfg.refresh_token === "number" && !isNaN(cfg.refresh_token))
                        ) {

                            // Discord Token
                            const refreshToken = require('../api/refreshToken');

                            refreshToken({
                                client_id: tinyCfg.client_id,
                                client_secret: tinyCfg.client_secret,
                                refresh_token: cfg.refresh_token,
                                redirect_uri: tinyCfg.redirect,
                                scope: tinyCfg.discordScope.join(' ')
                            })

                                // Success
                                .then(json => {

                                    // Valid Json Data
                                    if (objType(json, 'object')) {

                                        // Check Token
                                        if (typeof json.access_token === "string" || typeof json.access_token === "number") {

                                            // Token
                                            result.tokenRequest = json;
                                            result.fn = function () { res.redirect(redirect_value); };

                                            // Return Result
                                            resolve(result);

                                        }

                                        // Nope
                                        else {
                                            reject({ code: 500, message: 'Invalid User Token Data!' });
                                        }

                                    }

                                    // Nope
                                    else {
                                        reject({ code: 500, message: 'Invalid JSON Token Data!' });
                                    }

                                    // Complete
                                    return;

                                })

                                // Fail
                                .catch(err => {
                                    reject({ code: err.response.status, message: err.message });
                                });

                        }

                        // Nope
                        else {
                            reject({ code: 401, message: 'Invalid Refresh Token Data!' });
                        }

                    } else {
                        resolve(result);
                    }
                } else {
                    reject({ code: 401, message: 'Incorrect csrfToken!' });
                }

            }

            // Nope
            else {
                reject({ code: 500, message: 'Invalid Config Values!' });
            }

        }

        // Nope
        else {
            reject({ code: 500, message: 'Invalid ' + type + ' Values!' });
        }

        // Complete
        return;

    });
}