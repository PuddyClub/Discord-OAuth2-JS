
module.exports = async function (req, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Modules
        const _ = require('lodash');
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // Detect Config
        if (objType(cfg, 'object')) {

            // Create Settings
            const tinyCrypto = _.defaultsDeep({}, cfg.crypto, require('@tinypudding/puddy-lib/crypto/default.json'));

            // Detect Config
            if (objType(tinyCrypto, 'object')) {

                // Create Settings
                const tinyCfg = _.defaultsDeep({}, cfg.auth, {
                    redirect: 'http://localhost/redirect',
                    discordScope: [],
                    client_id: '',
                    client_secret: '',
                    first_get_user: true
                });

                // Detect Query
                if (objType(req.query, 'object')) {

                    // Get State
                    if (typeof req.query.state === "string") {

                        // Crypto
                        req.query.state = require('@tinypudding/puddy-lib/crypto/decrypt')(tinyCrypto, req.query.state);

                        // Convert
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

                            // Prepare Resolve Data
                            const resolveData = { newSession: false, state: req.query.state };

                            // Final Redirect
                            resolveData.redirect = '/';
                            if (typeof req.query.state.redirect === "string") {
                                resolveData.redirect += req.query.state.redirect;
                            }

                            // Exist Session
                            if (!existSession || req.query.state.type === "webhook") {

                                if (
                                    (typeof req.query.code === "string" && req.query.code.length > 0) ||
                                    (typeof req.query.code === "number" && !isNaN(req.query.code))
                                ) {

                                    // Discord Token
                                    const getToken = require('../api/getToken');

                                    getToken({
                                        client_id: tinyCfg.client_id,
                                        client_secret: tinyCfg.client_secret,
                                        code: req.query.code,
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
                                                    resolveData.tokenRequest = json;

                                                    // Login Type
                                                    if (req.query.state.type === "login") {

                                                        // Check New Session
                                                        resolveData.newSession = true;

                                                        // Get User Data
                                                        if (tinyCfg.first_get_user) {

                                                            // Discord Token
                                                            const getUser = require('../api/getUser');

                                                            // Get User
                                                            getUser(json.access_token)

                                                                // Get User
                                                                .then(dsUser => {

                                                                    // Validate Data
                                                                    if (objType(dsUser, 'object')) {
                                                                        resolveData.user = dsUser;
                                                                        resolve(resolveData);
                                                                    }

                                                                    // Nope
                                                                    else {
                                                                        reject({ code: 500, message: 'Invalid JSON User Data!' });
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

                                                            // Return Result
                                                            resolve(resolveData);

                                                        }

                                                    }

                                                    // Webhook Type
                                                    else if (req.query.state.type === "webhook") {

                                                        // Guild ID
                                                        if (typeof req.query.guild_id === "string") {
                                                            resolveData.guild_id = req.query.guild_id;
                                                        }

                                                        // Return Result
                                                        resolve(resolveData);

                                                    }

                                                    // Unknown
                                                    else {
                                                        reject({ code: 400, message: 'Invalid State Type!' });
                                                    }

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
                                        });

                                } else {
                                    reject({ code: 401, message: 'Invalid Discord Code!' });
                                }

                            } else {
                                resolve({ newSession: false });
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
                reject({ code: 500, message: 'Invalid Crypto Values!' });
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