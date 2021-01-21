
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
                client_secret: '',
                refresh_token: ''
            });

            // Detect Query
            if (objType(req.query, 'object')) {

                // Get State
                if (typeof req.query.state === "string") {
                    try {
                        req.query.state = JSON.parse(req.query.state);
                    } catch (err) {
                        req.query.state = {};
                    }
                } else {
                    req.query.state = {};
                }

                // Detect State
                if (objType(req.query.state, 'object')) {

                    // Check Session
                    if (typeof tinyCfg.csrfToken !== "string" || tinyCfg.csrfToken.length < 1 || (typeof req.query.state.csrfToken === "string" && req.query.state.csrfToken === tinyCfg.csrfToken)) {

                        // Result
                        const result = { refreshed: false };

                        // Exist Session
                        if (existSession) {

                            // Discord Token
                            const refreshToken = require('../api/refreshToken');

                            refreshToken({
                                client_id: tinyCfg.client_id,
                                client_secret: tinyCfg.client_secret,
                                refresh_token: tinyCfg.refresh_token,
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
                                            result.data = json;

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

                        } else {
                            resolve(result);
                        }
                    } else {
                        reject({ code: 401, message: 'Incorrect csrfToken!' });
                    }

                }

                // Nope
                else {
                    reject({ code: 401, message: 'Invalid State Query!' });
                }

            }

            // Nope
            else {
                reject({ code: 401, message: 'Invalid Query URL!' });
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