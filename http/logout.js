
module.exports = async function (req, res, cfg, existSession) {
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

            const tinyCfg = _.defaultsDeep({}, cfg.auth, {
                csrfToken: ''
            });

            const tinyOptions = _.defaultsDeep({}, cfg.auth, {
                access_token: '',
                client_id: ''
            });

            // Exist Query Setting
            if (objType(tinyQuery, 'object')) {

                // Exist Query
                if ((typeof tinyCfg.csrfToken !== "string" || tinyCfg.csrfToken.length < 1) || (
                    objType(req.query, 'object') &&
                    typeof req.query[tinyQuery.csrfToken] === "string" && tinyCfg.csrfToken === req.query[tinyQuery.csrfToken]
                )) {

                    // Prepare Final Redirect
                    let finalRedirect = '/';

                    // Redirect
                    if (typeof req.query[tinyQuery.redirect] === "string") {

                        if (req.query[tinyQuery.redirect].startsWith('/')) {
                            finalRedirect = req.query[tinyQuery.redirect].substring(1);
                        } else {
                            finalRedirect = req.query[tinyQuery.redirect];
                        }

                    }

                    // Result
                    const result = { fn: function () { res.redirect(finalRedirect); }, data: null, existSession: (existSession) };

                    // Exist Session
                    if (existSession) {

                        // Exist Token
                        if (
                            (
                                (typeof tinyOptions.access_token === "string" && tinyOptions.access_token.length > 0) ||
                                (typeof tinyOptions.access_token === "number" && !isNaN(tinyOptions.access_token))
                            ) &&
                            (
                                (typeof tinyOptions.client_id === "string" && tinyOptions.client_id.length > 0) ||
                                (typeof tinyOptions.client_id === "number" && !isNaN(tinyOptions.client_id))
                            )
                        ) {

                            // Get API HTTP and Revoke the Token
                            const revokeToken = require('../api/revokeToken');
                            revokeToken(tinyOptions).then((data) => {
                                result.data = data;
                                resolve(result);
                                return;
                            }).catch(err => {
                                reject({ code: err.response.status, message: err.message });
                                return;
                            });

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