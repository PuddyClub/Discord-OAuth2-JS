
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

                    // Exist Session
                    if (existSession) {

                        // Exist Token
                        if (
                            (typeof cfg.access_token === "string" && cfg.access_token.length > 0) ||
                            (typeof cfg.access_token === "number" && !isNaN(access_token))
                        ) {

                            // Get API HTTP and Revoke the Token
                            const revokeToken = require('../api/revokeToken');
                            revokeToken(cfg.access_token).then((data) => {
                                resolve({ fn: function () { res.redirect(finalRedirect); }, data: data });
                                return;
                            }).catch(err => {
                                reject({ code: err.response.status, message: err.message });
                            });

                        }

                        // Nope
                        else {
                            reject({ code: 401, message: 'Invalid Token!' });
                        }

                    }

                    // Nope
                    else {
                        resolve(function () { res.redirect(finalRedirect); });
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