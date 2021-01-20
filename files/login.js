
module.exports = function (req, res, cfg, existSession) {

    // Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, cfg.auth, {
        redirect: 'http://localhost/redirect',
        scope: [],
        discordID: ''
    });

    // Validate Config
    if (objType(tinyCfg, 'object')) {

        // Default Values State
        let tinyState = _.defaultsDeep({}, cfg.state, {
            csrfToken: '',
            redirect: ''
        });

        // Validate State
        if (objType(tinyState, 'object')) {

            // Create Settings
            const tinyQuery = _.defaultsDeep({}, cfg.query, {
                redirect: 'redirect'
            });

            // Exist Cfg
            if (objType(tinyQuery, 'object')) {

                // Redirect
                let returnRedirect = '/';
                req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].trim();
                if (objType(req.query, 'object') && typeof req.query[tinyQuery.redirect] === "string" && !req.query[tinyQuery.redirect].startsWith('http')) {


                    if (req.query[tinyQuery.redirect].startsWith('/')) {
                        req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].substring(1);
                    }

                    // Return Redirect
                    tinyState.redirect = req.query[tinyQuery.redirect];
                    returnRedirect = req.query[tinyQuery.redirect];

                    // Fix Redirect
                    returnRedirect = '/' + returnRedirect;

                }

                // Prepare State
                tinyState = encodeURIComponent(JSON.stringify(tinyState));

                // Don't exist session
                if (!existSession) {

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

                    // Redirect URL
                    return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${tinyCfg.discordID}&scope=${tinyCfg.scopeURI}&response_type=code&redirect_uri=${tinyCfg.redirect}&state=${tinyState}`);

                }

                // Yes
                else { return res.redirect(returnRedirect); }

            }

            // Nope
            else {
                if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 400); } else {
                    return cfg.errorCallback({ code: 400, message: 'Invalide Request!' });
                }

            }

        }

        // Error
        else {
            if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 400); } else {
                return cfg.errorCallback({ code: 400, message: 'Invalide State Config!' });
            }
        }

    }

    // Error
    else {
        if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 400); } else {
            return cfg.errorCallback({ code: 400, message: 'Invalide System Config!' });
        }
    }

}