
module.exports = async function (req, res, cfg, existSession) {
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
                discordID: '',
                discordSecret: '',
                needVerification: false,
                getUser: true
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

                        // Prepare Resolve Data
                        const resolveData = { newSession: false, state: req.query.state };

                        // Exist Session
                        if (!existSession) {

                            // Check New Session
                            resolveData.newSession = true;

                            if (
                                (typeof req.query.code === "string" && req.query.code.length > 0) ||
                                (typeof req.query.code === "number" && !isNaN(req.query.code))
                            ) {

                                // Discord Token
                                const getToken = require('./api/getToken');

                                getToken({
                                    client_id: tinyCfg.discordID,
                                    client_secret: tinyCfg.discordSecret,
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
                                                resolveData.token = json;

                                                // Get User Data
                                                if (tinyCfg.getUser) {

                                                    // Discord Token
                                                    const getUser = require('./api/getUser');

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
                                                            reject({ code: err.response.status, message: err.message });
                                                            return;
                                                        });

                                                }

                                                // Nope
                                                else {

                                                    // Return Result
                                                    resolve(resolveData);

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
                                        reject({ code: err.response.status, message: err.message });
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
            reject({ code: 500, message: 'Invalid Config Values!' });
        }

        // Complete
        return;

    });
}