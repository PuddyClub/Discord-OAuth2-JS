
module.exports = async function (req, res, cfg, existSession) {

    // Prepare Modules
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Prepare Final Redirect
    let finalRedirect = '/';

    // Redirect
    if (req.query.redirect) {

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