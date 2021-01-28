module.exports = function (app, cfg) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Config
    if (objType(cfg, 'object')) {

        // Logger
        let logger = null;
        try {
            logger = require('@tinypudding/firebase-lib/logger');
        } catch (err) {
            logger = console;
        }

        // Get Discord User
        const getDiscordUser = require('../api/getUser');

        // Discord session
        const discordSession = {};

        // Firebase Auth
        discordSession.firebaseAuth = {};

        // Redirect
        discordSession.firebaseAuth.redirect = {

            template: function (type, res, redirect_url, csrfToken, firebase_auth) {

                // Fix URL
                if (redirect_url.startsWith('/')) { redirect_url = redirect_url.substring(1); }

                // New URL
                redirect_url = `${tinyURLPath[type]}?redirect=${encodeURIComponent(redirect_url)}`;
                if (typeof csrfToken === "string") { redirect_url += `&key=${csrfToken}`; }
                if (typeof firebase_auth === "string") { redirect_url += `&token=${firebase_auth}`; }

                // Complete
                res.redirect(redirect_url);
                return;

            },

            // Login
            login: function (res, redirect_url, csrfToken) {
                return discordSession.firebaseAuth.redirect.template('firebaseLogin', res, redirect_url, csrfToken);
            },

            // Logout
            logout: function (res, redirect_url, csrfToken, firebase_auth) {
                return discordSession.firebaseAuth.redirect.template('firebaseLogout', res, redirect_url, csrfToken, firebase_auth);
            }

        };

        // Get Firebase UID
        discordSession.uidGenerator = function (userID) {
            return `discord_user_id_${tinyAuth.client_id}_${encodeURIComponent(userID)}`;
        };

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

        // Prepare Firebase Items
        const prepare_fire_auth_discord = function (req) {

            // Discord Session
            const dsSession = discordSession.get(req);
            const preparedsSession = {};

            for (const item in dsSession) {
                if ((typeof dsSession[item] === "string" && dsSession[item].length > 0) || (typeof dsSession[item] === "number" && !isNaN(dsSession[item]))) {
                    preparedsSession[item] = dsSession[item];
                }
            }

            // Complete
            return preparedsSession;

        };

        // Firebase Discord Auth
        discordSession.firebase = {};

        discordSession.firebase.createAccountData = function (access_token, userData, oldData) {

            // Prepare New User Data
            const newUserData = {};
            const existOLD = (objType(oldData, 'object'));

            // Password
            if (typeof access_token === "string" && access_token.length > 0) {
                newUserData.password = access_token;
            }

            // Main Data
            const newUsername = userData.username + '#' + userData.discriminator;
            const newAvatar = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`;

            // Basic Profile
            if (!existOLD || newUsername !== oldData.displayNama) { newUserData.displayName = newUsername; }
            if (!existOLD || newAvatar !== oldData.photoURL) { newUserData.photoURL = newAvatar; }

            // Insert User Email
            if (typeof userData.email === "string") {
                if (!existOLD || userData.email !== oldData.email) {
                    newUserData.email = userData.email;
                    newUserData.emailVerified = (userData.verified);
                }
            }

            // Complete
            return newUserData;

        };

        // Set User
        discordSession.firebase.set = function (req, user) {
            return new Promise(function (resolve, reject) {

                // UID
                const uid = discordSession.uidGenerator(user.id);
                const claims = prepare_fire_auth_discord(req);

                // Prepare Auth
                cfg.firebase.auth.createCustomToken(uid, claims)

                    // Complete
                    .then((customToken) => {
                        req.session[sessionVars.firebase_auth_token] = customToken;
                        resolve(customToken);
                        return;
                    })

                    // Error
                    .catch((err) => {
                        reject({ code: 500, message: err.message });
                        return;
                    });

                // Complete
                return;

            });
        };

        // Get User
        discordSession.firebase.get = function (req, res) {
            return new Promise(function (resolve, reject) {

                // Prepare Auth
                cfg.firebase.auth.verifyIdToken(req.session[sessionVars.firebase_token])

                    // Complete
                    .then((decodedToken) => {

                        // Validar se o IP do usuário é o mesmo do Token
                        console.log(decodedToken);
                        /* 
                        
                        decodedToken.sub
                        
                        // Get the request IP address.
                        const requestIpAddress = req.connection.remoteAddress;
                            // Check if the request IP address origin is suspicious relative to previous
                            // IP addresses. The current request timestamp and the auth_time of the ID
                            // token can provide additional signals of abuse especially if the IP address
                            // suddenly changed. If there was a sudden location change in a
                            // short period of time, then it will give stronger signals of possible abuse.
                            if (!isValidIpAddress(previousIpAddresses, requestIpAddress)) {
                              // Invalid IP address, take action quickly and revoke all user's refresh tokens.
                              revokeUserTokens(claims.uid).then(() => {
                                res.status(401).send({error: 'Unauthorized access. Please login again!'});
                              }, error => {
                                res.status(401).send({error: 'Unauthorized access. Please login again!'});
                              });
                            } else {
                              // Access is valid. Try to return data.
                              getData(claims).then(data => {
                                res.end(JSON.stringify(data);
                              }, error => {
                                res.status(500).send({ error: 'Server error!' })
                              });
                            }
                        
                        */

                        // Complete
                        req.firebase_session = decodedToken;
                        resolve();
                        return;

                    })

                    // Error
                    .catch((err) => {
                        reject({ code: 500, message: err.message });
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

        // Firebase Redirect
        const firebase_redirect = { login: require('../firebase_redirect/login'), logout: require('../firebase_redirect/logout') };
        for (const page in firebase_redirect) {
            for (const item in firebase_redirect[page]) {
                firebase_redirect[page][item] = firebase_redirect[page][item].toString();
            }
        }

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.cfg, {

            // Need Verification 
            needEmailVerified: true,

            // Error Callback
            errorCallback: function (err, req, res) {
                if (res) {
                    return res.json(err);
                } else {
                    logger.error(error);
                }
            },

            // Redirect
            redirect: {

                /* Login */
                login: function (data, req, res) {
                    return res.json(data);
                },

                /* Logout */
                logout: function (data, req, res) {
                    return res.json(data);
                },

                webhook: function (data, req, res) {
                    return res.json(data);
                }

            }

        });


        // Final Result
        const final_functions = {

            // API
            addGuildMember: function (data) {
                const addGuildMember = require('../api/addGuildMember');
                return addGuildMember(tinyAuth.bot_token, data);
            },

            getGuildWidget: function (guildID) {
                const getGuildWidget = require('../api/getGuildWidget');
                return getGuildWidget(guildID);
            },

            // UID Generator
            uidGenerator: function (userID) {
                return discordSession.uidGenerator(userID);
            },

            // Session Plugins
            sessionPlugins: {

                // Get User Module
                getUser: function (req, res, next) {

                    // Get User Discord Data
                    const access_token = req.session[sessionVars.access_token];
                    if (typeof access_token === "string") {
                        getDiscordUser(access_token).then(user => {

                            // Set Discord Data
                            req.discord_session.user = user;

                            // Complete
                            next();
                            return;

                        }).catch(err => {
                            if (!req.discord_session.errors) { req.discord_session.errors = {}; }
                            req.discord_session.errors.user = err;
                            delete req.discord_session.user;
                            prepare_final_session(req, res, err);
                            return;
                        });
                    } else { next(); }

                    // Complete
                    return;

                },

                // Get User Module
                getUserConnections: function (req, res, next) {

                    // Get User Discord Data
                    if (typeof req.session[sessionVars.access_token] === "string") {
                        require('../api/getUserConnections')(req.session[sessionVars.access_token]).then(connections => {

                            // Set Discord Data
                            req.discord_session.connections = connections;

                            // Complete
                            next();
                            return;

                        }).catch(err => {
                            if (!req.discord_session.errors) { req.discord_session.errors = {}; }
                            req.discord_session.errors.connections = err;
                            delete req.discord_session.connections;
                            prepare_final_session(req, res, err);
                            return;
                        });
                    } else { next(); }

                    // Complete
                    return;

                },

                // Get User Module
                getUserGuilds: function (req, res, next) {

                    // Get User Discord Data
                    if (typeof req.session[sessionVars.access_token] === "string") {
                        require('../api/getUserGuilds')(req.session[sessionVars.access_token]).then(guilds => {

                            // Set Discord Data
                            req.discord_session.guilds = guilds;

                            // Complete
                            next();
                            return;

                        }).catch(err => {
                            if (!req.discord_session.errors) { req.discord_session.errors = {}; }
                            req.discord_session.errors.guilds = err;
                            delete req.discord_session.guilds;
                            prepare_final_session(req, res, err);
                            return;
                        });
                    } else { next(); }

                    // Complete
                    return;

                }

            }

        };

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
            discordScope: ["identify", "email"]
        });

        // Need Identify
        if (tinyAuth.discordScope.indexOf('identify') < 0) { tinyAuth.discordScope.push('identify'); }
        if (tinyAuth.discordScope.indexOf('email') < 0) { tinyAuth.discordScope.push('email'); }

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
            csrfToken: 'csrfToken',
            scope: 'scope',
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
            redirect: '/redirect',
            firebaseLogin: '/firebase/login',
            firebaseLogout: '/firebase/logout'
        });

        // Logout Firebase
        const logout_firebase = (res, req, redirect, firebase_auth) => {

            // Firebase Logout
            if (cfg.firebase) {
                return discordSession.firebaseAuth.redirect.logout(res, redirect, req.csrfToken.now.value, firebase_auth);
            }

            // Normal
            else {
                return res.redirect(redirect);
            }

        };

        // Logout Result
        const logout_result = (req, user) => {
            return new Promise(function (resolve) {

                // Firebase Logout
                if (cfg.firebase) {

                    // Revoke Refresh
                    cfg.firebase.auth
                        .revokeRefreshTokens(discordSession.uidGenerator(user.id))
                        .then(() => {
                            req.session = null;
                            resolve(user);
                            return;
                        }).catch(err => {
                            req.session = null;
                            resolve(user);
                            return;
                        });
                }

                // Nope
                else { req.session = null; resolve(user); }

                // Complete
                return;

            });
        };

        // Auto Logout
        const auto_logout = function (req) {
            return new Promise(function (resolve, reject) {

                // Result
                discordAuth.logout(req, req.session[sessionVars.access_token],
                    {

                        // CSRF Token
                        csrfToken: req.csrfToken.now.value,

                        // Query
                        query: {
                            csrfToken: 'csrfToken',
                            redirect: 'redirect'
                        },

                        // State
                        state: {
                            csrfToken: req.csrfToken.now.value,
                            redirect: req.url
                        },

                        // Auth
                        auth: tinyAuth

                    }, (getSessionFromCookie(req, sessionVars.access_token), req.session[sessionVars.access_token]),
                ).then(result => {

                    // Discord Logout Complete
                    if (result.complete) {
                        logout_result(req, result.user).then(() => {
                            resolve(result); return;
                        }).catch(err => {
                            reject(err); return;
                        });
                    }

                    // Nope
                    else {
                        resolve(result);
                    }

                    return;

                }).catch((err) => { reject(err); return; });

                // Complete
                return;

            });
        };

        // Prepare Final Session
        const prepare_final_session = function (req, res, err) {

            // Firebase Auth
            const firebase_auth = req.session[sessionVars.firebase_token];
            tinyCfg.errorCallback(err);

            // Logout
            auto_logout(req).then(result => {
                logout_firebase(res, req, result.redirect, firebase_auth);
                return;
            }).catch(err => {
                tinyCfg.errorCallback(err, req, res);
                return;
            });

            // Complete
            return;

        };

        // Check Discord Session
        const checkDiscordSession = function (req, res, next, userFiredata) {

            // Validar se os dados do Firebase são os mesmos do Discord
            console.log(userFiredata);

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

                            // Set Cookie Session
                            discordSession.set(req, result.tokenRequest);

                            // Exist Firebase
                            if (cfg.firebase) {

                                // Set New Firebase Session Data
                                const access_token = req.session[sessionVars.access_token];
                                getDiscordUser(access_token).then(user => {

                                    cfg.firebase.auth.setCustomUserClaims(discordSession.uidGenerator(user.id), prepare_fire_auth_discord(req))
                                        .then(() => {
                                            next(); return;
                                        }).catch((err) => { prepare_final_session(req, res, err); return; });

                                    // Complete
                                    return;

                                }).catch(err => {
                                    prepare_final_session(req, res, err); return;
                                });

                            }

                            // Nope
                            else { next(); return; }

                        }

                        // Nope
                        else { next(); }

                        // Complete
                        return;

                    }).catch((err) => { prepare_final_session(req, res, err); return; });

                }

                // Finish the Session
                else { prepare_final_session(req, res); }

            } else { next(); }

            // Complete
            return;

        };

        // Refresh Validator
        app.use(function (req, res, next) {

            // Add Discord Session
            if (!req.discord_session) { req.discord_session = {}; }

            // Empty CSRF Token
            if (!req.csrfToken) { req.csrfToken = { new: {}, now: {} }; }

            // Preparing Clocks
            if (!req.utc_clock) {
                req.utc_clock = { now: moment.tz('Universal') };
            }

            // Exist Discord Session
            const existDiscordSession = (typeof req.session[sessionVars.token_expires_in] === "string" && typeof req.session[sessionVars.access_token] === "string" && typeof req.session[sessionVars.refresh_token] === "string");

            // Exist Session
            if (existDiscordSession &&
                !req.url.startsWith(tinyURLPath.firebaseLogin + '?') && req.url !== tinyURLPath.firebaseLogin &&
                !req.url.startsWith(tinyURLPath.firebaseLogout + '?') && req.url !== tinyURLPath.firebaseLogout
            ) {

                // Exist Firebase
                if (cfg.firebase) {

                    discordSession.firebase.get().then((userFiredata) => {

                        // Complete
                        checkDiscordSession(req, res, next, userFiredata);
                        return;

                    }).catch(err => {

                        // Firebase Auth
                        const firebase_auth = req.session[sessionVars.firebase_token];

                        // Logout
                        auto_logout(req, err).then(result => {
                            logout_firebase(res, req, result.redirect, firebase_auth);
                            return;
                        }).catch(err => {
                            tinyCfg.errorCallback(err, req, res);
                            return;
                        });

                        // Complete
                        return;

                    });

                }

                // Nope
                else {
                    checkDiscordSession(req, res, next);
                }

            } else { next(); }

            // Complete
            return;

        });

        // Prepare Body Parser
        let bodyParser = {};
        if (cfg.bodyParser) {
            bodyParser.json = cfg.bodyParser.json();
            bodyParser.urlencoded = cfg.bodyParser.urlencoded({ extended: true });
        }

        // Login Firebase
        const firebaseLoginCallback = (req, res) => {

            console.log(req);

            // Exist Discord
            if (req.discord_session.user) {

                // Exist Body
                if (objType(req.body, 'object') && typeof req.body.token === "string") {

                    // Exist Query
                    if (
                        typeof req.csrfToken.now.value !== "string" || req.csrfToken.now.value.length < 1 ||
                        typeof req.body.csrfToken === "string" && req.csrfToken.now.value === cfg.csrfToken
                    ) {

                        // Get Session
                        req.session[sessionVars.firebase_token] = req.body.token;
                        const uid = discordSession.uidGenerator(req.discord_session.user.id);
                        const firebaseAccount = discordSession.firebase.createAccountData(req.session[sessionVars.access_token], req.discord_session);

                        console.log(uid, firebaseAccount);

                        // Update User
                        cfg.firebase.auth
                            .updateUser(uid, firebaseAccount)
                            .then(() => {
                                return res.json({ success: true });
                            })
                            .catch((error) => {
                                logger.error(error);
                                return res.json({ success: false, error: 'Error updating user' });
                            });

                        // Complete
                        return;

                    }

                    // Nope
                    else {
                        return res.json({ success: false, error: 'Invalid csrfToken!' });
                    }

                }

                // Nope
                else {
                    return res.json({ success: false, error: 'Invalid Data!' });
                }

            }

            // Nope
            else {
                return res.json({ success: false, error: 'Invalid Discord User!' });
            }

        };

        if (cfg.bodyParser) { app.post(tinyURLPath.firebaseLogin, bodyParser.json, bodyParser.urlencoded, final_functions.sessionPlugins.getUser, firebaseLoginCallback); }
        else { app.post(tinyURLPath.firebaseLogin, final_functions.sessionPlugins.getUser, firebaseLoginCallback); }
        app.get(tinyURLPath.firebaseLogin, (req, res) => {

            // Final Data
            const final_data = {};

            // Exist Redirect
            if (typeof req.query.redirect === "string") {
                final_data.redirect = '/' + req.query.redirect;
            } else {
                final_data.redirect = '/';
            }

            // Auth Token
            if (typeof req.session[sessionVars.firebase_auth_token] === "string") {

                // Insert Data
                if (typeof req.query.key === "string" && req.query.key.length > 0) { final_data.key = req.query.key; }
                final_data.functions = firebase_redirect.login;
                final_data.token = req.session[sessionVars.firebase_auth_token];

                // Complete
                return tinyCfg.redirect.login(final_data, req, res);

            }

            // Nope
            else { return res.redirect(final_data.redirect); }

        });

        // Logout Firebase
        const firebaseLogoutCallback = (req, res) => {
            req.session[sessionVars.firebase_token] = null;
            return res.json({ success: true });
        };

        if (cfg.bodyParser) { app.post(tinyURLPath.firebaseLogout, bodyParser.json, bodyParser.urlencoded, firebaseLogoutCallback); }
        else { app.post(tinyURLPath.firebaseLogout, firebaseLogoutCallback); }
        app.get(tinyURLPath.firebaseLogout, (req, res) => {

            // Final Data
            const final_data = {};

            // Exist Redirect
            if (typeof req.query.redirect === "string") {
                final_data.redirect = '/' + req.query.redirect;
            } else {
                final_data.redirect = '/';
            }

            // Exist Token
            if (typeof req.query.firebase_auth === "string") {

                // Insert Data
                if (typeof req.query.key === "string" && req.query.key.length > 0) { final_data.key = req.query.key; }
                final_data.functions = firebase_redirect.logout;
                final_data.token = req.query.firebase_auth;

                // Complete
                return tinyCfg.redirect.logout(final_data, req, res);

            }

            // Nope
            else { return res.redirect(final_data.redirect); }

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
                        csrfToken: req.csrfToken.now.value
                    }

                }, (getSessionFromCookie(req, sessionVars.access_token)),
            );

            // Complete
            return;

        });

        // Logout
        app.get(tinyURLPath.logout, (req, res) => {

            // Firebase Auth
            const firebase_auth = req.session[sessionVars.firebase_token];

            // Result
            discordAuth.logout(req, req.session[sessionVars.access_token],
                {

                    // CSRF Token
                    csrfToken: req.query[sessionVars.csrfToken],

                    // Query
                    query: {
                        csrfToken: 'csrfToken',
                        redirect: 'redirect'
                    },

                    // State
                    state: {
                        csrfToken: req.csrfToken.now.value
                    },

                    // Auth
                    auth: tinyAuth

                }, (getSessionFromCookie(req, sessionVars.access_token), req.session[sessionVars.access_token]),
            ).then(result => {

                // Discord Logout Complete
                if (result.complete) {
                    logout_result(req, result.user).then(() => {
                        logout_firebase(res, req, result.redirect, firebase_auth);
                        return;
                    }).catch(err => {
                        tinyCfg.errorCallback(err, req, res); return;
                    });
                }

                // Nope
                else {
                    res.redirect(result.redirect);
                }

                // Complete
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
                        csrfToken: req.csrfToken.now.value
                    }

                }, (getSessionFromCookie(req, sessionVars.access_token)),
            ).then(result => {

                // New Session Result
                if (result.state.type === "login" && result.newSession) {

                    if (!tinyCfg.needEmailVerified || result.user.verified) {

                        // Set Cookie Session
                        discordSession.set(req, result.tokenRequest);

                        // Set Firebase Session
                        if (cfg.firebase) {
                            discordSession.firebase.set(req, result.user).then(() => {
                                discordSession.firebaseAuth.redirect.login(res, result.redirect, result.state.csrfToken);
                                return;
                            }).catch(err => {

                                // Firebase Auth
                                const firebase_auth = req.session[sessionVars.firebase_token];

                                // Logout
                                auto_logout(req, { code: 500, message: err.message }).then(result => {
                                    logout_firebase(res, req, result.redirect, firebase_auth);
                                    return;
                                }).catch(err => {
                                    tinyCfg.errorCallback(err, req, res);
                                    return;
                                });

                                // Complete
                                return;

                            });
                        }

                        // Normal
                        else {
                            res.redirect(result.redirect);
                        }

                    }

                    // Nope
                    else {
                        tinyCfg.errorCallback({ code: 401, message: 'This email is not a verified email!' }, req, res);
                    }

                }

                // Normal Redirect
                else {

                    if (typeof tinyCfg.redirect[result.state.type] === "function") {
                        tinyCfg.redirect[result.state.type](result, req, res);
                    }

                    // Nope
                    else {
                        res.redirect(result.redirect);
                    }

                };

                // Complete
                return;

            }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

            // Complete
            return;

        });

        // Complete
        return final_functions;

    }

    // Nope
    else {
        throw new Error('Invalid Config Value!');
    }

};