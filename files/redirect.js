
module.exports = async function (req, res, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Modules
        const _ = require('lodash');
        const objType = require('@tinypudding/puddy-lib/get/objType');
        const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');

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
                    const resolveData = { newSession: false };

                    // Exist Session
                    if (!existSession) {

                        // Check New Session
                        resolveData.newSession = true;

                        if (typeof req.query.code === "string" && req.query.code.length > 0) {

                            // Discord Token
                            const getToken = require('./api/getToken');

                            const code = req.query.code;
                            getToken({
                                client_id: tinyCfg.discordID,
                                client_secret: tinyCfg.discordSecret,
                                code: code,
                                redirect_uri: tinyCfg.redirect,
                                scope: tinyCfg.discordScope.join(' ')
                            })

                                // Success
                                .then(json => {

                                    // Check Token
                                    if (objType(json, 'object') && objType(json.data, 'object') && (typeof json.data.access_token === "string" || typeof json.data.access_token === "number")) {

                                        // Token
                                        resolveData.token = json;

                                        // Get User Data
                                        if (tinyCfg.getUser) {

                                            // Discord Token
                                            const getUser = require('./api/getUser');

                                            // Get User
                                            getUser(json.data.access_token)

                                                // Get User
                                                .then(dsUser => {

                                                    // User Verified
                                                    if ((objType(dsUser.data, 'object') && dsUser.data.verified) || !tinyCfg.needVerification) {

                                                        // User Data
                                                        resolveData.user = dsUser;
                                                        resolve({});

                                                    }

                                                    // Ops!
                                                    else {
                                                        reject({ code: 401, message: 'Discord account need to be verified.' });
                                                    }

                                                })

                                                // Fail
                                                .catch(err => {
                                                    reject({ code: err.response.status, message: err.message });
                                                });

                                        }

                                        // Nope
                                        else {



                                        }

                                    } else {
                                        reject({ code: 500, message: 'Incorrect User Data!' });
                                    }

                                })

                                // Fail
                                .catch(err => {
                                    reject({ code: err.response.status, message: err.message });
                                });

                        } else {
                            reject({ code: 401, message: 'Incorrect Discord Code!' });
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

        // Complete
        return;

    });
}