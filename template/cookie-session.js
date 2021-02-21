module.exports = function (app, cfg) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');
    const hash = require('object-hash');

    // Config
    if (objType(cfg, 'object')) {

        // Validator Session Discord and Firebase
        const sessionFirebaseDiscordValidator = function (req) {
            return (req.firebase_session.uid === `${discordSession.varsTemplate.uid}${tinyAuth.client_id}_${req.discord_session.user.id}`);
        };

        // Prepare Base
        app.use((req, res, next) => {

            // Add Discord Session
            if (!req.discord_session) { req.discord_session = {}; }

            // Complete
            next();
            return;

        });

        // Logger
        let logger = null;
        try {
            logger = require('@tinypudding/firebase-lib/logger');
        } catch (err) {
            logger = console;
        }

        // Get Discord User
        const getDiscordUser = require('../api/getUser');

        // Get User IP
        const getUserIP = require('@tinypudding/puddy-lib/http/userIP');

        // Discord session
        const discordSession = {};

        // Firebase Auth
        discordSession.firebaseAuth = {};

        // Redirect
        discordSession.firebaseAuth.redirect = {

            template: function (type, req, res, redirect_url, csrfToken, firebase_auth) {

                // Get Domain
                const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);

                // Fix URL
                if (redirect_url.startsWith('/')) { redirect_url = redirect_url.substring(1); }

                // New URL
                redirect_url = `${tinyURLPath[type]}?redirect=${encodeURIComponent(redirect_url)}`;
                if (typeof csrfToken === "string") { redirect_url += `&key=${csrfToken}`; }
                if (typeof firebase_auth === "string") { redirect_url += `&token=${firebase_auth}`; }

                // Complete
                res.redirect(tinyDomain + redirect_url);
                return;

            },

            // Login
            login: function (req, res, redirect_url, csrfToken) {
                return discordSession.firebaseAuth.redirect.template('firebaseLogin', req, res, redirect_url, csrfToken);
            },

            // Logout
            logout: function (req, res, redirect_url, csrfToken, firebase_auth) {
                return discordSession.firebaseAuth.redirect.template('firebaseLogout', req, res, redirect_url, csrfToken, firebase_auth);
            }

        };

        // Variables
        discordSession.varsTemplate = {
            uid: 'discord_user_id_',
            avatarURL: 'https://cdn.discordapp.com/avatars/'
        };

        // Get Firebase UID
        discordSession.uidGenerator = function (userID) {
            return `${discordSession.varsTemplate.uid}${tinyAuth.client_id}_${encodeURIComponent(userID)}`;
        };

        // Session Set
        discordSession.set = function (req, tokenRequest, extra_text = '') {

            // Session Items
            req.session[sessionVars.access_token + extra_text] = tokenRequest.access_token;
            req.session[sessionVars.refresh_token + extra_text] = tokenRequest.refresh_token;
            req.session[sessionVars.token_type + extra_text] = tokenRequest.token_type;
            req.session[sessionVars.scope + extra_text] = tokenRequest.scope;

            // Expire In
            req.session[sessionVars.token_expires_in + extra_text] = moment.tz('Universal').add(tokenRequest.expires_in, 'second').format();

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
        const prepare_fire_auth_discord = function (req, user) {

            // Discord Session
            const dsSession = discordSession.get(req);
            const preparedsSession = {};

            // Scope
            if (typeof dsSession.scope === "string") {
                preparedsSession.scope = dsSession.scope.split(' ');
            } else {
                preparedsSession.scope = dsSession.scope;
            }

            // User IP
            const requestIpAddress = getUserIP(req, { isFirebase: true });
            preparedsSession.user_ip = requestIpAddress.value;
            preparedsSession.user_ip_type = requestIpAddress.type;

            // Discord
            preparedsSession.discord = user;

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
            const newAvatar = `${discordSession.varsTemplate.avatarURL}${userData.id}/${userData.avatar}`;

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

        discordSession.firebase.updateUser = function (access_token, user, oldUser) {
            return new Promise(function (resolve, reject) {

                // Prepare MD5
                const validator = {};

                validator.user = hash(user);
                if (objType(oldUser, 'object')) { validator.oldUser = hash(oldUser) } else {
                    validator.oldUser = '';
                }

                // Validate
                if (validator.user !== validator.oldUser) {

                    // Get UID
                    const uid = discordSession.uidGenerator(user.id);
                    const firebaseAccount = discordSession.firebase.createAccountData(access_token, user, oldUser);

                    // Update User
                    cfg.firebase.auth
                        .updateUser(uid, firebaseAccount)
                        .then((userRecord) => {
                            resolve({ updated: true, uid: uid, newData: firebaseAccount, userRecord: userRecord }); return;
                        })
                        .catch((error) => {
                            reject(error); return;
                        });

                }

                // Nope
                else {
                    resolve({ updated: false });
                }

                // Complete
                return;

            });
        };

        // Set User
        discordSession.firebase.set = function (req, user) {
            return new Promise(function (resolve, reject) {

                // UID
                const uid = discordSession.uidGenerator(user.id);
                const claims = prepare_fire_auth_discord(req, user);

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

                        // Get Request IP
                        const requestIpAddress = getUserIP(req, { isFirebase: true });

                        // Convert
                        if (typeof decodedToken.user_ip === "string") { decodedToken.user_ip = [decodedToken.user_ip]; }
                        if (typeof requestIpAddress.value === "string") { requestIpAddress.value = [requestIpAddress.value]; }

                        // Verification
                        if (hash(decodedToken.user_ip) === hash(requestIpAddress.value) && decodedToken.user_ip_type === requestIpAddress.type) {
                            req.firebase_session = decodedToken;
                            resolve();
                        }

                        // Nope
                        else {
                            reject({ code: 406, message: 'Invalid User IP Session!' });
                        }

                        // Complete
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
        const clone = require('clone');

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
                    logger.error(err);
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

        // Auth Config
        const tinyAuth = _.defaultsDeep({}, cfg.auth, {
            redirect: "",
            client_id: "",
            client_secret: "",
            bot_token: "",
            first_get_user: true,
            discordScope: ["identify", "email"]
        });

        // Auth Commands Config
        const tinyCommandAuth = _.defaultsDeep({}, cfg.comamndAuth, {
            redirect: tinyAuth.redirect,
            client_id: tinyAuth.client_id,
            client_secret: tinyAuth.client_secret,
            bot_token: tinyAuth.bot_token,
            first_get_user: tinyAuth.first_get_user,
            discordScope: ["applications.commands"]
        });

        // Bot Auth
        const botAuth = _.defaultsDeep({}, cfg.bot, {
            discordScope: ['bot', 'applications.commands'],
            permissions: 0
        });

        // Final Result
        const final_functions = {

            // Auth
            auth: tinyAuth,
            commandAuth: tinyCommandAuth,

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

            // Session Validator
            sessionValidator: function (data = {}) {
                return (req, res, next) => {

                    // Validator Progress
                    const validatorItems = {
                        values: ['getUserConnections', 'getUser', 'getUserGuilds'], count: 0,
                        callback: function () {

                            // The Item
                            const item = validatorItems.values[validatorItems.count];
                            if (typeof item === "string") {

                                // Read Item
                                if (data[item]) {
                                    final_functions.sessionPlugins[item](req, res, () => {
                                        validatorItems.count++;
                                        return validatorItems.callback();
                                    });
                                } else {
                                    validatorItems.count++;
                                    validatorItems.callback();
                                }

                            }

                            // Next
                            else {
                                final_functions.sessionPlugins.validator(req, res, () => { next(); return; });
                            }

                            // Complete
                            return;

                        }
                    };

                    // Complete
                    return validatorItems.callback();

                };
            },

            // Session Plugins
            sessionPlugins: {

                // Session Validator
                validator: function (req, res, next) {

                    // Empty CSRF Token
                    if (!req.csrfToken) { req.csrfToken = { new: {}, now: {} }; }

                    // Preparing Clocks
                    if (!req.utc_clock) {
                        req.utc_clock = { now: moment.tz('Universal') };
                    }

                    // Add Auth
                    req.discord_session.auth = {
                        app: tinyAuth,
                        command: tinyCommandAuth,
                        bot: botAuth
                    };

                    // Exist Discord Session
                    const existDiscordSession = (typeof req.session[sessionVars.token_expires_in] === "string" && typeof req.session[sessionVars.access_token] === "string" && typeof req.session[sessionVars.refresh_token] === "string");

                    // Exist Session
                    if (existDiscordSession &&
                        !req.url.startsWith(tinyURLPath.firebaseLogin + '?') && req.url !== tinyURLPath.firebaseLogin &&
                        !req.url.startsWith(tinyURLPath.firebaseLogout + '?') && req.url !== tinyURLPath.firebaseLogout
                    ) {

                        // Exist Firebase
                        if (cfg.firebase) {

                            // Finish the Session
                            const finishTinySession = function (err) {

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

                            };

                            discordSession.firebase.get(req, res).then(() => {

                                // Discord and Firebase same session
                                if (!req.discord_session.user || sessionFirebaseDiscordValidator(req)) {
                                    checkDiscordSession(req, res, next);
                                }

                                // Nope
                                else {
                                    finishTinySession();
                                }

                                return;

                            }).catch(err => {
                                finishTinySession(err);
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

                },

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
            commandLogin: '/commandLogin',
            botLogin: '/botLogin',
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
                return discordSession.firebaseAuth.redirect.logout(req, res, redirect, req.csrfToken.now.value, firebase_auth);
            }

            // Normal
            else {

                // Get Domain
                const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);
                return res.redirect(tinyDomain + redirect);

            }

        };

        // Logout Result
        const logout_result = (req, user) => {
            return new Promise(function (resolve) {

                // Firebase Logout
                if (cfg.firebase) {

                    // Exist User
                    if (user) {

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
                    else {
                        req.session = null;
                        resolve();
                    }

                }

                // Nope
                else { req.session = null; resolve(user); }

                // Complete
                return;

            });
        };

        // Remove Values
        const removeCommandSession = function (req, callback) {

            // Session Items
            delete req.session[sessionVars.access_token + '_command'];
            delete req.session[sessionVars.refresh_token + '_command'];
            delete req.session[sessionVars.token_type + '_command'];
            delete req.session[sessionVars.scope + '_command'];

            // Expire In
            delete req.session[sessionVars.token_expires_in + '_command'];

            // Complete
            return callback();

        };

        // Logout Action
        const logout_action = function (req, csrfToken, redirect) {
            return new Promise(function (resolve) {

                // State
                const state = { csrfToken: req.csrfToken.now.value };

                // Redirect
                if (redirect) { state.redirect = redirect; }

                // Result
                const finalResult = function () {

                    discordAuth.logout(req, req.session[sessionVars.access_token],
                        {

                            // CSRF Token
                            csrfToken: csrfToken,

                            // Query
                            query: {
                                csrfToken: 'csrfToken',
                                redirect: 'redirect'
                            },

                            // State
                            state: state,

                            // Auth
                            auth: tinyAuth

                        }, (getSessionFromCookie(req, sessionVars.access_token), req.session[sessionVars.access_token]),
                    ).then(result => {
                        resolve(result);
                        return;
                    }).catch((err) => { resolve(err); return; });

                    // Complete
                    return;

                };

                // Normal
                if (typeof req.session[sessionVars.access_token + '_command'] !== "string") {
                    finalResult();
                }

                // Remove Command Token
                else {

                    // Prepare Auth
                    const commandAuth = clone(tinyAuth);
                    commandAuth.discordScope = ['applications.commands', 'applications.commands.update'];

                    discordAuth.logout(req, req.session[sessionVars.access_token],
                        {

                            // CSRF Token
                            csrfToken: csrfToken,

                            // Query
                            query: {
                                csrfToken: 'csrfToken',
                                redirect: 'redirect'
                            },

                            // State
                            state: state,

                            // Auth
                            auth: commandAuth

                        }, (getSessionFromCookie(req, sessionVars.access_token), req.session[sessionVars.access_token]),
                    ).then(result => {
                        removeCommandSession(req, finalResult);
                        return;
                    }).catch((err) => { removeCommandSession(req, finalResult); return; });

                }

                // Complete
                return;

            });
        };

        // Auto Logout
        const auto_logout = function (req, err) {
            return new Promise(function (resolve, reject) {

                // Print Error
                if (err) { tinyCfg.errorCallback(err); }

                // Result
                logout_action(req, req.csrfToken.now.value, req.url).then(result => {

                    // Discord Logout Complete
                    logout_result(req, result.user).then(() => {
                        resolve(result); return;
                    }).catch(err => {
                        reject(err); return;
                    });

                    return;

                });

                // Complete
                return;

            });
        };

        // Prepare Final Session
        const prepare_final_session = function (req, res, err) {

            // Firebase Auth
            const firebase_auth = req.session[sessionVars.firebase_token];
            if (err) { tinyCfg.errorCallback(err); }

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
        const checkDiscordSession = function (req, res, next) {

            // Rest Checker
            const restChecker = function () {

                // Add to Req
                if (typeof req.session[sessionVars.access_token + '_command'] === "string" || typeof req.session[sessionVars.access_token + '_command'] === "number") {

                    // Add Access Command
                    req.discord_session.commands = {};
                    req.discord_session.commands.access_token = req.session[sessionVars.access_token + '_command'];

                    // Other Values
                    if (typeof req.session[sessionVars.token_type + '_command'] === "string" || typeof req.session[sessionVars.token_type + '_command'] === "number") {
                        req.discord_session.commands.token_type = req.session[sessionVars.token_type + '_command']
                    }

                    if (typeof req.session[sessionVars.scope + '_command'] === "string" || typeof req.session[sessionVars.scope + '_command'] === "number") {
                        req.discord_session.commands.scope = req.session[sessionVars.scope + '_command']
                    }

                }

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

                                        // Set Custom Usre Claims
                                        cfg.firebase.auth.setCustomUserClaims(discordSession.uidGenerator(user.id), prepare_fire_auth_discord(req, user))
                                            .then(() => {

                                                // Update User Data
                                                /* discordSession.firebase.updateUser(access_token, user).then(function () {
                                                    next();
                                                    return;
                                                }).catch(error => {
                                                    logger.error(error);
                                                    prepare_final_session(req, res, error);
                                                    return;
                                                }); */

                                                next();
                                                return;

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

                } else {

                    // Exist Discord Session Data and Firebase
                    if (cfg.firebase && req.discord_session.user && objType(req.firebase_session, 'object')) {

                        // Set New Firebase Session Data
                        const access_token = req.session[sessionVars.access_token];

                        // Prepare OLD User
                        /* const oldUser = {};

                        // Get ID
                        oldUser.id = req.firebase_session.uid.substring(discordSession.varsTemplate.uid.length + tinyAuth.client_id.length + 1);

                        // Convert Username
                        oldUser.username = req.firebase_session.name.split('#');

                        // Get Discriminator
                        oldUser.discriminator = oldUser.username[oldUser.username.length - 1];

                        // Remove Discriminator
                        oldUser.username.pop();

                        // Insert Username
                        oldUser.username = oldUser.username.join('#');

                        // Get Avatar
                        oldUser.avatar = req.firebase_session.picture.substring(discordSession.varsTemplate.avatarURL.length + oldUser.id.length + 1);

                        // Get Email
                        oldUser.email = req.firebase_session.email;
                        oldUser.verified = req.firebase_session.email_verified; */

                        // Prepare New User
                        const user = {
                            id: req.discord_session.user.id,
                            username: req.discord_session.user.username,
                            avatar: req.discord_session.user.avatar,
                            discriminator: req.discord_session.user.discriminator,
                            email: req.discord_session.user.email,
                            verified: req.discord_session.user.verified,
                        };

                        // Update User Data
                        const make_the_update = function () {
                            /* 
                                                    discordSession.firebase.updateUser(access_token, user, oldUser).then(function () {
                                                        next();
                                                        return;
                                                    }).catch(error => {
                                                        logger.error(error);
                                                        prepare_final_session(req, res, error);
                                                        return;
                                                    });
                             */
                            next();
                            return;

                        };

                        // Check Need Update
                        let needUpdate = false;
                        if (!objType(req.firebase_session.discord, 'object') || hash(req.firebase_session.discord) !== hash(req.discord_session.user)) {
                            needUpdate = true;
                        }

                        // User Verified
                        if (!needUpdate) { make_the_update(); }

                        // Nope
                        else {
                            cfg.firebase.auth.setCustomUserClaims(discordSession.uidGenerator(req.discord_session.user.id), prepare_fire_auth_discord(req, req.discord_session.user))
                                .then(() => {
                                    make_the_update();
                                    return;
                                }).catch((err) => { prepare_final_session(req, res, err); return; });
                        }

                    }

                    // Nope
                    else { next(); }

                }

                // Complete
                return;

            };

            // Get Token Expiration
            req.utc_clock.ds_token_expires_in = moment.tz(req.session[sessionVars.token_expires_in], 'Universal');

            // Time Left
            req.utc_clock.ds_token_time_left = req.utc_clock.ds_token_expires_in.diff(req.utc_clock.now, 'minutes');

            // Command Time Left
            if (!req.session[sessionVars.token_expires_in + '_command']) {
                return restChecker();
            }

            // Nope
            else {

                // Get Token Expiration
                req.utc_clock.ds_token_expires_in_command = moment.tz(req.session[sessionVars.token_expires_in + '_command'], 'Universal');

                // Time Left
                req.utc_clock.ds_token_time_left_command = req.utc_clock.ds_token_expires_in.diff(req.utc_clock.now, 'minutes');

                // Need Refresh
                if (req.utc_clock.ds_token_time_left_command < 1440) {

                    // Prepare Auth
                    const commandAuth = clone(tinyAuth);
                    commandAuth.discordScope = ['applications.commands', 'applications.commands.update'];

                    // Logout
                    const logoutCommand = function () {

                        // Revoke Token
                        const revokeToken = require('../api/revokeToken');
                        revokeToken(req.session[sessionVars.access_token + '_command'], commandAuth).then((data) => {
                            removeCommandSession(req, restChecker);
                            return;

                        }).catch(err => {
                            removeCommandSession(req, restChecker);
                            return;
                        });

                        // Complete
                        return;

                    };

                    // Not Expired
                    if (req.utc_clock.ds_token_time_left_command > 0) {

                        discordAuth.refreshToken(req,
                            {

                                // Auth
                                auth: commandAuth,

                                // Refresh Token
                                refresh_token: req.session[sessionVars.refresh_token + '_command']

                            }, (getSessionFromCookie(req, sessionVars.access_token)),
                        ).then((result) => {

                            // Complete
                            if (result.refreshed) {
                                discordSession.set(req, result.tokenRequest, '_command');
                            }

                            // Rest
                            restChecker();
                            return;

                        }).catch(async err => {
                            logoutCommand();
                            return;
                        });

                    }

                    // Finish the Session
                    else { logoutCommand(); }

                } else {
                    restChecker();
                }

            }

            // Complete
            return;

        };

        // Prepare Body Parser
        let bodyParser = {};
        if (cfg.bodyParser) {
            bodyParser.json = cfg.bodyParser.json();
            bodyParser.urlencoded = cfg.bodyParser.urlencoded({ extended: true });
        }

        // Login Firebase
        const firebaseLoginCallback = (req, res) => {

            // Remove OLD Auth Token
            req.session[sessionVars.firebase_auth_token] = null;

            // Exist Discord
            if (req.discord_session.user) {

                // Exist Body
                if (objType(req.body, 'object') && typeof req.body.token === "string") {

                    // Exist Query
                    if (
                        typeof req.csrfToken.now.value !== "string" || req.csrfToken.now.value.length < 1 ||
                        (typeof req.body.csrfToken === "string" && req.csrfToken.now.value === req.body.csrfToken)
                    ) {

                        // Get Session
                        req.session[sessionVars.firebase_token] = req.body.token;
                        /* discordSession.firebase.updateUser(req.session[sessionVars.access_token], req.discord_session.user).then(function () {
                            res.json({ success: true });
                            return;
                        }).catch(error => {
                            logger.error(error);
                            res.json({ success: false, error: 'Error updating user' });
                            return;
                        }); */
                        res.json({ success: true });

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

        if (cfg.bodyParser) { app.post(tinyURLPath.firebaseLogin, bodyParser.json, bodyParser.urlencoded, final_functions.sessionPlugins.getUser, final_functions.sessionPlugins.validator, firebaseLoginCallback); }
        else { app.post(tinyURLPath.firebaseLogin, final_functions.sessionPlugins.getUser, final_functions.sessionPlugins.validator, firebaseLoginCallback); }
        app.get(tinyURLPath.firebaseLogin, final_functions.sessionPlugins.validator, (req, res) => {

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
            else {

                // Get Domain
                const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);
                return res.redirect(tinyDomain + final_data.redirect);

            }

        });

        // Logout Firebase
        const firebaseLogoutCallback = (req, res) => {
            req.session[sessionVars.firebase_token] = null;
            return res.json({ success: true });
        };

        if (cfg.bodyParser) { app.post(tinyURLPath.firebaseLogout, bodyParser.json, bodyParser.urlencoded, final_functions.sessionPlugins.validator, firebaseLogoutCallback); }
        else { app.post(tinyURLPath.firebaseLogout, final_functions.sessionPlugins.validator, firebaseLogoutCallback); }
        app.get(tinyURLPath.firebaseLogout, final_functions.sessionPlugins.validator, (req, res) => {

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
                final_data.originalKey = req.csrfToken.now.value;
                final_data.functions = firebase_redirect.logout;
                final_data.token = req.query.firebase_auth;

                // Complete
                return tinyCfg.redirect.logout(final_data, req, res);

            }

            // Nope
            else {

                // Get Domain
                const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);
                return res.redirect(tinyDomain + final_data.redirect);

            }

        });

        // Login
        if (typeof tinyURLPath.login === "string") {
            app.get(tinyURLPath.login, final_functions.sessionPlugins.validator, (req, res) => {

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
                        },

                        // Port
                        port: cfg.port

                    }, (getSessionFromCookie(req, sessionVars.access_token)),
                );

                // Complete
                return;

            });
        }

        // Command Login
        if (typeof tinyURLPath.commandLogin === "string") {
            app.get(tinyURLPath.commandLogin, final_functions.sessionPlugins.validator, (req, res) => {

                // Prepare Auth
                const commandAuth = clone(tinyCommandAuth);

                // Result
                discordAuth.login(req, res,
                    {

                        // Error
                        errorCallback: tinyCfg.errorCallback,

                        // Crypto
                        crypto: tinyCrypto,

                        // Auth
                        auth: commandAuth,

                        // Type
                        type: 'login_command',

                        // Query
                        query: { redirect: 'redirect' },

                        // State
                        state: {
                            csrfToken: req.csrfToken.now.value
                        },

                        // Port
                        port: cfg.port

                    }, (getSessionFromCookie(req, sessionVars.access_token)),
                );

                // Complete
                return;

            });
        }

        // Add Commands
        if (typeof tinyURLPath.botLogin === "string") {
            app.get(tinyURLPath.botLogin, (req, res) => {
                return res.redirect(`${require('../config.json').oauth2}?client_id=${encodeURIComponent(tinyAuth.client_id)}&scope=${encodeURIComponent(botAuth.discordScope.join(' '))}&permissions=${botAuth.permissions}`);
            });
        }

        // Logout
        app.get(tinyURLPath.logout, final_functions.sessionPlugins.validator, (req, res) => {

            // Firebase Auth
            const firebase_auth = req.session[sessionVars.firebase_token];

            // Result

            logout_action(req, req.query[sessionVars.csrfToken]).then(result => {

                // Discord Logout Complete
                logout_result(req, result.user).then(() => {
                    logout_firebase(res, req, result.redirect, firebase_auth);
                    return;
                }).catch(err => {
                    tinyCfg.errorCallback(err, req, res); return;
                });

                // Complete
                return;

            });

            // Complete
            return;

        });

        // Redirect
        app.get(tinyURLPath.redirect, final_functions.sessionPlugins.validator, (req, res) => {

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

                    // Verified
                    if (!tinyCfg.needEmailVerified || result.user.verified) {

                        // Set Cookie Session
                        discordSession.set(req, result.tokenRequest);

                        // Set Firebase Session
                        if (cfg.firebase) {
                            discordSession.firebase.set(req, result.user).then(() => {
                                discordSession.firebaseAuth.redirect.login(req, res, result.redirect, result.state.csrfToken);
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

                            // Get Domain
                            const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);
                            res.redirect(tinyDomain + result.redirect);

                        }

                    }

                    // Nope
                    else {
                        tinyCfg.errorCallback({ code: 401, message: 'This email is not a verified email!' }, req, res);
                    }

                }

                // Command
                else if (result.state.type === 'login_command') {

                    // Verified
                    if (!tinyCfg.needEmailVerified || result.user.verified) {

                        // Set Cookie Session
                        discordSession.set(req, result.tokenRequest, '_command');

                        // Get Domain
                        const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);
                        res.redirect(tinyDomain + result.redirect);

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

                        // Get Domain
                        const tinyDomain = require('@tinypudding/puddy-lib/http/getDomainURL')(req, cfg.port);
                        res.redirect(tinyDomain + result.redirect);

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