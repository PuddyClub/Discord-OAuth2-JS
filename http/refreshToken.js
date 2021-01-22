
module.exports = async function (req, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Modules
        const _ = require('lodash');
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // Detect Config
        if (objType(cfg, 'object')) {

            // Create Settings
            const tinyCfg = _.defaultsDeep({}, cfg.auth, {
                redirect: 'http://localhost/redirect',
                discordScope: [],
                client_id: '',
                client_secret: ''
            });

            const tinyQuery = _.defaultsDeep({}, cfg.auth, {
                redirect: 'redirect'
            });

            // Prepare Final Redirect
            let finalRedirect = '/';

            // Redirect
            if (objType(tinyQuery, 'object') && objType(req.query, 'object') && typeof tinyQuery.redirect === "string" && typeof req.query[tinyQuery.redirect] === "string") {

                if (req.query[tinyQuery.redirect].startsWith('/')) {
                    finalRedirect = req.query[tinyQuery.redirect].substring(1);
                } else {
                    finalRedirect = req.query[tinyQuery.redirect];
                }

            }

            // Check Session
            if (typeof tinyCfg.csrfToken !== "string" || tinyCfg.csrfToken.length < 1 || (typeof req[type].csrfToken === "string" && req[type].csrfToken === tinyCfg.csrfToken)) {

                // Result
                const result = { refreshed: false, redirect: finalRedirect };

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
                                reject(err);
                                return;
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

        // Complete
        return;

    });
}