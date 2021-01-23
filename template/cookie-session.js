module.exports = function (app, cfg) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Config
    if (objType(cfg, 'object')) {

        // Moment
        const moment = require('moment-timezone');

        // Modules
        const _ = require('lodash');

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.cfg, {
            errorCallback: function (err) {
                return res.json(err);
            }
        });

        // Test Modules Prepare
        const discordAuth = require('../index');
        const getSessionFromCookie = require('../get/cookie-session');

        // Auth Config
        const tinyAuth = _.defaultsDeep({}, cfg.auth, {
            redirect: "",
            client_id: "",
            client_secret: "",
            bot_token: "",
            first_get_user: true,
            discordScope: []
        });

        // Session Vars
        const sessionVars = _.defaultsDeep({}, cfg.vars, {
            access_token: 'access_token',
            expires_in: 'expires_in',
            refresh_token: 'refresh_token',
            token_type: 'token_type',
            scope: 'scope',
            csrfToken: 'csrfToken',
            token_expires_in: 'token_expires_in'
        });

        // Crypto Values
        const tinyCrypto = _.defaultsDeep({}, cfg.crypto, require('@tinypudding/puddy-lib/crypto/default.json'));

        // Crypto Values
        const tinyURLPath = _.defaultsDeep({}, cfg.url, {
            login: '/login',
            logout: '/logout',
            redirect: '/redirect'
        });

        // Refresh Validator
        app.use(function (req, res, next) {

            // Preparing Clocks
            const tinyClock = { now: moment.tz('Universal') };
            tinyClock.token_expires_in = moment.tz('Universal', req.session[sessionVars.token_expires_in]);

            console.log(req.session);
            console.log(tinyClock.now.format(), tinyClock.token_expires_in.format());

            // Complete
            next();
            return;

        });

        // Login
        app.get(tinyURLPath.login, (req, res) => {

            // Result
            discordAuth.login(req, res,
                {

                    // Error
                    errorCallback: tinyCfg.errorCallback,

                    // Crypto
                    crypto: tinyCrypto,

                    // Auth
                    auth: tinyAuth,

                    // Type
                    type: 'login',

                    // Query
                    query: { redirect: 'redirect' },

                    // State
                    state: {
                        csrfToken: req.session[sessionVars.csrfToken]
                    }

                }, (getSessionFromCookie(req, sessionVars.access_token)),
            );

            // Complete
            return;

        });

        // Logout
        app.get(tinyURLPath.logout, (req, res) => {

            // Result
            discordAuth.logout(req, res, req.session,
                {

                    // Query
                    query: {
                        csrfToken: 'csrfToken',
                        redirect: 'redirect'
                    },

                    // State
                    state: {
                        csrfToken: req.session[sessionVars.csrfToken]
                    },

                    // Auth
                    auth: tinyAuth,

                    // Access Token
                    access_token: req.session[sessionVars.access_token]

                }, (getSessionFromCookie(req, sessionVars.access_token)),
            ).then(result => {

                // Complete
                req.session = null;
                res.redirect(result.redirect);
                return;

            }).catch(tinyCfg.errorCallback);

            // Complete
            return;

        });

        // Redirect
        app.get(tinyURLPath.redirect, (req, res) => {

            // Result
            discordAuth.redirect(req,
                {

                    // Auth
                    auth: tinyAuth,

                    // Crypto
                    crypto: tinyCrypto,

                    // Query
                    query: { redirect: 'redirect' },

                    // State
                    state: {
                        csrfToken: req.session[sessionVars.csrfToken]
                    }

                }, (getSessionFromCookie(req, sessionVars.access_token)),
            ).then(result => {

                // New Session Result
                if (result.state.type === "login" && result.newSession) {

                    // Session Items
                    req.session[sessionVars.access_token] = result.tokenRequest.access_token;
                    req.session[sessionVars.expires_in] = result.tokenRequest.expires_in;
                    req.session[sessionVars.refresh_token] = result.tokenRequest.refresh_token;
                    req.session[sessionVars.token_type] = result.tokenRequest.token_type;
                    req.session[sessionVars.scope] = result.tokenRequest.scope;

                    // Expire In
                    req.session[sessionVars.token_expires_in] = moment.tz('Universal').add(result.tokenRequest.expires_in, 'second').format();

                }

                // Complete
                res.redirect(result.redirect);
                return;

            }).catch(tinyCfg.errorCallback);

            // Complete
            return;

        });

        // Complete
        return;

    }

    // Nope
    else {
        throw new Error('Invalid Config Value!');
    }

};