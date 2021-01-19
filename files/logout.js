
module.exports = async function (req, res, cfg, existSession) {

    // Exist Session
    if (existSession) {

        // Get API HTTP and Revoke the Token
        const discord_api = require('./api');
        await discord_api.revokeToken(cfg.access_token);

        req.session = null;

        // Redirect
        if (req.query.redirect) {

            if (req.query.redirect.startsWith('/')) {
                req.query.redirect = req.query.redirect.substring(1);
            }

        } else {
            req.query.redirect = '';
        }

        return res.redirect('/' + req.query.redirect);

    } else {
        res.status(404); return res.render('error', { code: 404, text: 'Not Found' });
    }

}