
module.exports = async function (req, res, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Prepare Modules
        const objType = require('@tinypudding/puddy-lib/get/objType');
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
            if (typeof tinyCfg.csrfToken !== "string" || (
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

                    // Get API HTTP and Revoke the Token
                    const discord_api = require('./api');
                    discord_api.revokeToken(cfg.access_token).then(() => {
                        resolve(function () { res.redirect(finalRedirect); });
                        return;
                    }).catch(err => {
                        reject(err);
                    });

                }

                // Nope
                else {
                    resolve(function () { res.redirect(finalRedirect); });
                }

            }

            // Nope
            else {
                reject(new Error('Invalid csrfToken!'));
            }

        }

        // Nope
        else {
            reject(new Error('Invalid query setting!'));
        }

        // Action Complete
        return;

    });
}