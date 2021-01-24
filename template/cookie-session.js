module.exports = function (app, cfg) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Config
    if (objType(cfg, 'object')) {

        // Discord session
        const discordSession = {};

        // Session Set
        discordSession.set = function (req, tokenRequest) {

            // Session Items
            req.session[sessionVars.access_token] = tokenRequest.access_token;
            req.session[sessionVars.refresh_token] = tokenRequest.refresh_token;
            req.session[sessionVars.token_type] = tokenRequest.token_type;
            req.session[sessionVars.scope] = tokenRequest.scope;

            // Expire In
            req.session[sessionVars.token_expires_in] = moment.tz('Universal').add(tokenRequest.expires_in, 'second').format();

            // Complete
            return;

        };

        discordSession.get = function (req) {
            return {
                access_token: req.session[sessionVars.access_token],
                refresh_token: req.session[sessionVars.refresh_token],
                token_type: req.session[sessionVars.token_type],
                scope: req.session[sessionVars.scope],
                token_expires_in: req.session[sessionVars.token_expires_in],
            };
        };

        // Firebase Discord Auth
        discordSession.firebase = {};

        discordSession.firebase.set = function (req, userID) {
            return new Promise(function (resolve, reject) {

                // Discord Session
                const dsSession = discordSession.get(req);
                const preparedsSession = {};

                for (const item in dsSession) {
                    if ((typeof dsSession[item] === "string" && dsSession[item].length > 0) || (typeof dsSession[item] === "number" && !isNaN(dsSession[item]))) {
                        preparedsSession[item] = dsSession[item];
                    }
                }

                // Prepare Auth
                cfg.firebase.auth.createCustomToken(`discord_id_${encodeURIComponent(userID)}`, preparedsSession)

                    // Complete
                    .then((customToken) => {
                        req.session[sessionVars.firebase_auth_token] = customToken;
                        resolve();
                        return;
                    })

                    // Error
                    .catch((err) => {
                        reject(err);
                        return;
                    });

                // Complete
                return;

            });
        };

        discordSession.firebase.get = function (req, res) {
            return new Promise(function (resolve, reject) {

                // Prepare Auth
                cfg.firebase.auth.verifyIdToken(req.session[sessionVars.firebase_token])

                    // Complete
                    .then((decodedToken) => {
                        resolve(decodedToken);
                        return;
                    })

                    // Error
                    .catch((err) => {
                        err = { code: 500, message: err.message };
                        reject(err);
                        return;
                    });

                // Complete
                return;

            });
        };

        // Moment
        const moment = require('moment-timezone');

        // Modules
        const _ = require('lodash');

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.cfg, {
            errorCallback: function (err, req, res) {
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

        // Firebase Mode
        if (objType(cfg.firebase, 'object')) {

            // Fix First Get User Value
            tinyAuth.first_get_user = true;

            // Fix Auth Value
            if (!cfg.firebase.auth) { cfg.firebase.auth = cfg.firebase.root.auth(); }

        }

        // Session Vars
        const sessionVars = _.defaultsDeep({}, cfg.vars, {
            access_token: 'access_token',
            refresh_token: 'refresh_token',
            token_type: 'token_type',
            scope: 'scope',
            csrfToken: 'csrfToken',
            token_expires_in: 'token_expires_in',
            firebase_token: 'firebase_token',
            firebase_auth_token: 'firebase_auth_token'
        });

        // Crypto Values
        const tinyCrypto = _.defaultsDeep({}, cfg.crypto, require('@tinypudding/puddy-lib/crypto/default.json'));

        // Crypto Values
        const tinyURLPath = _.defaultsDeep({}, cfg.url, {
            login: '/login',
            logout: '/logout',
            redirect: '/redirect'
        });

        // Logout Result
        const logout_result = (result, req, res) => {

            // Complete
            req.session = null;
            res.redirect(result.redirect);
            return;

        };

        // Auto Logout
        const auto_logout = function (req, res, err) {
            return new Promise(function (resolve, reject) {

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
                            csrfToken: req.session[sessionVars.csrfToken],
                            redirect: req.url
                        },

                        // Auth
                        auth: tinyAuth,

                        // Access Token
                        access_token: req.session[sessionVars.access_token]

                    }, (getSessionFromCookie(req, sessionVars.access_token)),
                ).then(result => {

                    // Complete
                    if (!err) { logout_result(result, req, res); }
                    // Error
                    else { tinyCfg.errorCallback(err, req, res); }
                    resolve();
                    return;

                }).catch((err) => { tinyCfg.errorCallback(err, req, res); reject(err); return; });

                // Complete
                return;

            });
        };

        // Check Discord Session
        const checkDiscordSession = function (req, next) {

            req.utc_clock.ds_token_expires_in = moment.tz(req.session[sessionVars.token_expires_in], 'Universal');

            // Time Left
            req.utc_clock.ds_token_time_left = req.utc_clock.ds_token_expires_in.diff(req.utc_clock.now, 'minutes');

            // Need Refresh
            if (req.utc_clock.ds_token_time_left < 1440) {

                // Not Expired
                if (req.utc_clock.ds_token_time_left > 0) {

                    discordAuth.refreshToken(req,
                        {

                            // Auth
                            auth: tinyAuth,

                            // Refresh Token
                            refresh_token: req.session[sessionVars.refresh_token]

                        }, (getSessionFromCookie(req, sessionVars.access_token)),
                    ).then(result => {

                        // Complete
                        if (result.refreshed) {
                            discordSession.set(req, result.tokenRequest);
                            discordSession.firebase.get();
                        }

                        // Redirect
                        next();
                        return;

                    }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

                }

                // Finish the Session
                else { auto_logout(req, res); }

            } else { next(); }

            // Complete
            return;

        };

        // Refresh Validator
        app.use(function (req, res, next) {

            // Preparing Clocks
            if (!req.utc_clock) {
                req.utc_clock = { now: moment.tz('Universal') };
            }

            // Exist Discord Session
            const existDiscordSession = (typeof req.session[sessionVars.token_expires_in] === "string" && typeof req.session[sessionVars.access_token] === "string" && typeof req.session[sessionVars.refresh_token] === "string");

            // Exist Session
            if (existDiscordSession) {
                checkDiscordSession(req, next);
            } else { next(); }

            // Complete
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
                logout_result(result, req, res);
                return;
            }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

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

                    // Set Cookie Session
                    discordSession.set(req, result.tokenRequest);

                    // Set Firebase Session
                    if (cfg.firebase) {
                        discordSession.firebase.set(req, result.user.id).then(() => {
                            res.redirect(result.redirect);
                            return;
                        }).catch(err => {
                            auto_logout(req, res, { code: 500, message: err.message });
                            return;
                        });
                    }

                    // Normal
                    else {
                        res.redirect(result.redirect);
                    }

                }

                // Normal Redirect
                else { res.redirect(result.redirect) };

                // Complete
                return;

            }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

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