
module.exports = function (req, res, cfg, existSession) {

    // Modules
    const _ = require('lodash');
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');

    // Detect Config
    if (objType(cfg, 'object') && typeof cfg.type === "string" && (cfg.type === "login" || cfg.type === "webhook")) {

        // Create Settings
        const tinyCrypto = _.defaultsDeep({}, cfg.crypto, require('@tinypudding/puddy-lib/crypto/default.json'));

        // Detect Config
        if (objType(tinyCrypto, 'object')) {

            // Create Settings
            const tinyCfg = _.defaultsDeep({}, cfg.auth, {
                redirect: 'http://localhost/redirect',
                discordScope: [],
                client_id: ''
            });

            // Validate Config
            if (objType(tinyCfg, 'object')) {

                // Default Values State
                let tinyState = _.defaultsDeep({}, cfg.state, {
                    csrfToken: '',
                    redirect: '',
                    type: cfg.type
                });

                // Validate
                if (typeof tinyState.type !== "string") { tinyState.type = cfg.type; }

                // Validate State
                if (objType(tinyState, 'object')) {

                    // Create Settings
                    const tinyQuery = _.defaultsDeep({}, cfg.query, {
                        redirect: 'redirect'
                    });

                    // Exist Cfg
                    if (objType(tinyQuery, 'object')) {

                        // Get Domain
                        const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);

                        // Redirect
                        let returnRedirect = tinyDomain + '/';
                        if (objType(req.query, 'object')) {
                            if (typeof req.query[tinyQuery.redirect] === "string") {
                                req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].trim();
                                if (!req.query[tinyQuery.redirect].startsWith('http')) {


                                    if (req.query[tinyQuery.redirect].startsWith('/')) {
                                        req.query[tinyQuery.redirect] = req.query[tinyQuery.redirect].substring(1);
                                    }

                                    // Return Redirect
                                    tinyState.redirect = req.query[tinyQuery.redirect];
                                    returnRedirect = req.query[tinyQuery.redirect];

                                    // Fix Redirect
                                    returnRedirect = tinyDomain + '/' + returnRedirect;

                                } else { tinyState.redirect = ''; }
                            } else {
                                tinyState.redirect = '';
                                delete req.query[tinyQuery.redirect];
                            }
                        } else { tinyState.redirect = ''; }

                        // Don't exist session
                        if (!existSession || cfg.type === "webhook") {

                            // Redirect Result
                            const redirect_discord = require('../get/authURLGenerator')(tinyCfg, tinyState, tinyCrypto, cfg.type);
                            return res.redirect(redirect_discord);

                        }

                        // Yes
                        else { return res.redirect(returnRedirect); }

                    }

                    // Nope
                    else {
                        if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 400); } else {
                            return cfg.errorCallback({ code: 400, message: 'Invalide Request!' }, req, res);
                        }

                    }

                }

                // Error
                else {
                    if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 400); } else {
                        return cfg.errorCallback({ code: 400, message: 'Invalide State Config!' }, req, res);
                    }
                }

            }

            // Error
            else {
                if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 500); } else {
                    return cfg.errorCallback({ code: 500, message: 'Invalide System Config!' }, req, res);
                }
            }

        }

        // Nope
        else {
            if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 500); } else {
                return cfg.errorCallback({ code: 500, message: 'Invalid Crypto Values!' }, req, res);
            }
        }

    }

    // Nope
    else {
        if (typeof cfg.errorCallback !== "function") { return http_status.send(res, 500); } else {
            return cfg.errorCallback({ code: 500, message: 'Invalid Config Values!' }, req, res);
        }
    }

}