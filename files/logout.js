
module.exports = async function (req, res, cfg, existSession) {

    // Prepare Modules
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');
    const _ = require('lodash');

    // Create Settings
    const tinyQuery = _.defaultsDeep({}, cfg.query, {
        csrfToken: 'csrfToken',
        redirect: 'redirect'
    });

    // Prepare Final Redirect
    let finalRedirect = '/';

    // Redirect
    if (objType(req.query, 'object') && req.query.redirect) {

        if (req.query.redirect.startsWith('/')) {
            req.query.redirect = req.query.redirect.substring(1);
        }

    } else {
        req.query.redirect = '';
    }

    // Exist Session
    if (existSession) {

        // Get API HTTP and Revoke the Token
        const discord_api = require('./api');
        await discord_api.revokeToken(cfg.access_token);

        req.session = null;

    }

    // Action Complete
    return res.redirect(finalRedirect);

}