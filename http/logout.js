
module.exports = async function (req, access_token, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Prepare Modules
        const objType = require('@tinypudding/puddy-lib/get/objType');

        // Detect Config
        if (objType(cfg, 'object')) {

            const _ = require('lodash');

            // Create Settings
            const tinyQuery = _.defaultsDeep({}, cfg.query, {
                csrfToken: 'csrfToken',
                redirect: 'redirect'
            });

            const tinyState = _.defaultsDeep({}, cfg.state, {
                csrfToken: '',
                redirect: ''
            });

            // Exist Query Setting
            if (objType(tinyQuery, 'object')) {

                // Exist Query
                if (typeof tinyState.csrfToken !== "string" || tinyState.csrfToken.length < 1 || (
                    objType(req.query, 'object') &&
                    typeof cfg.csrfToken === "string" && tinyState.csrfToken === cfg.csrfToken
                )) {

                    // Result
                    const result = { data: null, existSession: (existSession), complete: false, state: { csrfToken: cfg.csrfToken } };

                    // Prepare Final Redirect
                    result.redirect = '/';

                    // Redirect
                    if (typeof tinyState.redirect === "string" && tinyState.redirect.length > 0) {

                        if (tinyState.redirect.startsWith('/')) {
                            result.redirect = tinyState.redirect.substring(1);
                        } else {
                            result.redirect = tinyState.redirect;
                        }

                    }

                    // Get Query
                    else if (typeof req.query[tinyQuery.redirect] === "string") {

                        if (req.query[tinyQuery.redirect].startsWith('/')) {
                            result.redirect = req.query[tinyQuery.redirect].substring(1);
                        } else {
                            result.redirect = req.query[tinyQuery.redirect];
                        }

                    }

                    // Exist Session
                    if (existSession) {

                        // Exist Token
                        if (
                            (typeof access_token === "string" && access_token.length > 0) ||
                            (typeof access_token === "number" && !isNaN(access_token))
                        ) {

                            // Prepare Auth
                            const tinyAuth = _.defaultsDeep({}, cfg.auth, {
                                client_id: '',
                                client_secret: '',
                                redirect_uri: ''
                            });

                            // Exist Client ID
                            if (
                                (typeof tinyAuth.client_id === "string" && tinyAuth.client_id.length > 0) ||
                                (typeof tinyAuth.client_id === "number" && !isNaN(tinyAuth.client_id))
                            ) {

                                // Exist Client Secret
                                if (
                                    (typeof tinyAuth.client_secret === "string" && tinyAuth.client_secret.length > 0) ||
                                    (typeof tinyAuth.client_secret === "number" && !isNaN(tinyAuth.client_secret))
                                ) {

                                    // End Discord
                                    const end_discord_session = function () {

                                        // Get API HTTP and Revoke the Token
                                        const revokeToken = require('../api/revokeToken');
                                        revokeToken(access_token, tinyAuth).then((data) => {
                                            result.complete = true;
                                            result.data = data;
                                            resolve(result);
                                            return;
                                        }).catch(err => {
                                            reject(err);
                                            return;
                                        });

                                        return;

                                    };

                                    // Don't need user info
                                    if (typeof access_token !== "string" || access_token.length < 1) { end_discord_session(); }

                                    // Yes
                                    else {

                                        // Get User
                                        const getUser = require('../api/getUser');
                                        getUser(access_token).then((data) => {
                                            result.user = data;
                                            end_discord_session();
                                            return;
                                        }).catch(err => {
                                            reject(err);
                                            return;
                                        });

                                    }

                                }

                                // Nope
                                else {
                                    reject({ code: 401, message: 'Invalid Client Secret!' });
                                }

                            }

                            // Nope
                            else {
                                reject({ code: 401, message: 'Invalid Client ID!' });
                            }

                        }

                        // Nope
                        else {
                            reject({ code: 401, message: 'Invalid Token Data!' });
                        }

                    }

                    // Nope
                    else {
                        resolve(result);
                    }

                }

                // Nope
                else {
                    reject({ code: 401, message: 'Invalid csrfToken!' });
                }

            }

            // Nope
            else {
                reject({ code: 401, message: 'Invalid query setting!' });
            }

        }

        // Nope
        else {
            reject({ code: 500, message: 'Invalid Config Values!' });
        }

        // Action Complete
        return;

    });
}