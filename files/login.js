
module.exports = async function (req, res, cfg, data) {

    // Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');

    if (!req.session.access_token) {

        // Create Settings
        const tinyQuery = _.defaultsDeep({}, cfg.query, {
            csrfToken: 'csrfToken',
            redirect: 'redirect'
        });

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.auth, {
            redirect: 'http://localhost/redirect',
            scope: []
        });

        // Default Values State
        let tinyState = _.defaultsDeep({}, cfg.state, {
            csrfToken: '',
            redirect: ''
        });

        if (objType(tinyQuery, 'object') && objType(tinyCfg, 'object') && objType(tinyState, 'object')) {

            // Redirect Fixed
            if (typeof tinyCfg.redirect === "string") {
                tinyCfg.redirect = encodeURIComponent(tinyCfg.redirect);
            } else {
                tinyCfg.redirect = '';
            }

            // Scopes
            tinyCfg.scopeURI = '';

            if (Array.isArray(tinyCfg.scope)) {
                for (const item in tinyCfg.scope) {
                    if (tinyCfg.scopeURI) {
                        tinyCfg.scopeURI += '%20';
                    }
                    tinyCfg.scopeURI += encodeURIComponent(tinyCfg.scope[item]);
                }
            }

            // Redirect
            if (objType(req.query, 'object') && typeof req.query[tinyQuery.redirect] === "string") {

                if (req.query[tinyQuery.redirect].startsWith('/')) {
                    req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].substring(1);
                }

                tinyState.redirect = req.query[tinyQuery.redirect];

            }

            tinyState = encodeURIComponent(JSON.stringify(tinyState));

            // Redirect URL
            return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${tinyCfg.discord.id}&scope=${tinyscopes}&response_type=code&redirect_uri=${redirect}&state=${data}`);

        }

    } else {
        return res.redirect('/');
    }

}