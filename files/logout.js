
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

        // Prepare Final Redirect
        let finalRedirect = '/';

        // Redirect
        if (objType(req.query, 'object') && req.query[tinyQuery.redirect]) {

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

        // Action Complete
        return;

    });
}