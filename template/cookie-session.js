module.exports = function (app, cfg) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Config
    if (objType(cfg, 'object')) {

        // Get Discord User
        const getDiscordUser = require('../api/getUser');

        // Discord session
        const discordSession = {};

        // Firebase Auth
        discordSession.firebaseAuth = {};

        // Redirect
        discordSession.firebaseAuth.redirect = {

            // Login
            login: function (res, redirect_url) {
                if (redirect_url.startsWith('/')) { redirect_url = redirect_url.substring(1); }
                res.redirect(`${tinyURLPath.firebaseLogin}?redirect=${encodeURIComponent(redirect_url)}`);
                return;
            },

            // Logout
            logout: function (res, redirect_url) {
                if (redirect_url.startsWith('/')) { redirect_url = redirect_url.substring(1); }
                res.redirect(`${tinyURLPath.firebaseLogout}?redirect=${encodeURIComponent(redirect_url)}`);
                return;
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

        // Update Session
        discordSession.firebase.updateSession = function (result) {
            if (result.updated) {
                console.log(result.data);
            }
        };

        // Set Firebase Account
        discordSession.firebase.setAccount = function (access_token, userData, oldData) {
            return new Promise(function (resolve, reject) {

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

                // Final Result
                const finalResult = { updated: false };

                // Update User
                if (Object.keys(newUserData).length > 0) {
                    cfg.firebase.auth.updateUser(userData.id, newUserData)
                        .then((userRecord) => {
                            finalResult.data = userRecord.toJSON();
                            finalResult.updated = true;
                            resolve(finalResult);
                            return;
                        })
                        .catch((err) => {
                            reject({ code: 500, message: err.message });
                        });
                }

                // Nope
                else {
                    resolve(finalResult);
                }

                // Complete
                return;

            });
        };

        // Set User
        discordSession.firebase.set = function (req, userID) {
            return new Promise(function (resolve, reject) {

                // Prepare Auth
                cfg.firebase.auth.createCustomToken(discordSession.uidGenerator(userID), prepare_fire_auth_discord(req))

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

        // Get User
        discordSession.firebase.get = function (req, res) {
            return new Promise(function (resolve, reject) {

                // Prepare Auth
                cfg.firebase.auth.verifyIdToken(req.session[sessionVars.firebase_token])

                    // Complete
                    .then((decodedToken) => {

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

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.cfg, {
            needEmailVerified: true,
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
            discordScope: ["identify", "email"]
        });

        // Fix Need Email Verified
        if (tinyCfg.needEmailVerified) {
            if (tinyAuth.discordScope.indexOf('identify') < 0) { tinyAuth.discordScope.push('identify'); }
            if (tinyAuth.discordScope.indexOf('email') < 0) { tinyAuth.discordScope.push('email'); }
        }

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
            redirect: '/redirect',
            firebaseLogin: '/firebase/login',
            firebaseLogout: '/firebase/logout'
        });

        // Logout Result
        const logout_result = (req, user) => {
            return new Promise(function (resolve, reject) {

                // Firebase Logout
                if (cfg.firebase) {

                    // Set New Firebase Session Data
                    getDiscordUser(req.session[sessionVars.access_token]).then(user => {

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

                        // Complete
                        return;

                    }).catch(err => {
                        reject(err); return;
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
                discordAuth.logout(req, req.session,
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

        // Check Discord Session
        const checkDiscordSession = function (req, res, next, userFiredata) {

            // GET USER DATA TO TEST
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
                                            discordSession.firebase.setAccount(access_token, user).then(result => {
                                                discordSession.firebase.updateSession(result);
                                                next(); return;
                                            }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });
                                            return;
                                        }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

                                    // Complete
                                    return;

                                }).catch(err => {
                                    tinyCfg.errorCallback(err, req, res); return;
                                });

                            }

                            // Nope
                            else { next(); return; }

                        }

                        // Nope
                        else { next(); }

                        // Complete
                        return;

                    }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

                }

                // Finish the Session
                else {
                    auto_logout(req).then(result => {

                        // Exist Firebase
                        if (cfg.firebase) {
                            discordSession.firebaseAuth.redirect.logout(res, result.redirect);
                        }

                        // Nope
                        else {
                            res.redirect(result.redirect);
                        }

                        // Complete
                        return;

                    }).catch(err => {
                        tinyCfg.errorCallback(err, req, res);
                        return;
                    });
                }

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

                // Exist Firebase
                if (cfg.firebase) {

                    // Exist Firebase
                    if (cfg.firebase) {
                        discordSession.firebase.get().then((userFiredata) => {

                            // Complete
                            checkDiscordSession(req, res, next, userFiredata);
                            return;

                        }).catch(err => {
                            auto_logout(req, err).then(result => {
                                discordSession.firebaseAuth.redirect.logout(res, result.redirect);
                                return;
                            }).catch(err => {
                                tinyCfg.errorCallback(err, req, res);
                                return;
                            });
                            return;
                        });
                    }

                }

                // Nope
                else {
                    checkDiscordSession(req, res, next);
                }

            } else { next(); }

            // Complete
            return;

        });

        // Login Firebase
        app.get(tinyURLPath.firebaseLogin, (req, res) => {

            // Page
            res.send('');

            // Complete
            return;

        });

        // Logout Firebase
        app.get(tinyURLPath.firebaseLogout, (req, res) => {

            // Page
            res.send('');

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
            discordAuth.logout(req, req.session,
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

                }, (getSessionFromCookie(req, sessionVars.access_token), req.session[sessionVars.access_token]),
            ).then(result => {

                // Discord Logout Complete
                if (result.complete) {
                    logout_result(req, result.user).then(() => {

                        // Exist Firebase
                        if (cfg.firebase) {
                            discordSession.firebaseAuth.redirect.logout(res, result.redirect);
                        }

                        // Nope
                        else {
                            res.redirect(result.redirect);
                        }

                        // Complete
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
                        csrfToken: req.session[sessionVars.csrfToken]
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
                            discordSession.firebase.set(req, result.user.id).then(() => {
                                discordSession.firebase.setAccount(result.tokenRequest.access_token, result.user).then(accountResult => {
                                    discordSession.firebase.updateSession(accountResult);
                                    discordSession.firebaseAuth.redirect.login(res, result.redirect);
                                    return;
                                }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });
                                return;
                            }).catch(err => {
                                auto_logout(req, { code: 500, message: err.message }).then(result => {
                                    discordSession.firebaseAuth.redirect.logout(res, result.redirect);
                                    return;
                                }).catch(err => {
                                    tinyCfg.errorCallback(err, req, res);
                                    return;
                                });
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
                else { res.redirect(result.redirect) };

                // Complete
                return;

            }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });

            // Complete
            return;

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
                            if (!req.discord_session) { req.discord_session = {}; }
                            req.discord_session.user = user;

                            if (cfg.firebase) {
                                let oldUser = null;
                                discordSession.firebase.setAccount(access_token, user, oldUser).then(result => {
                                    discordSession.firebase.updateSession(result);
                                    next(); return;
                                }).catch((err) => { tinyCfg.errorCallback(err, req, res); return; });
                            }

                            // Nope
                            else { next(); }

                            // Complete
                            return;

                        }).catch(err => {
                            if (req.discord_session) { delete req.discord_session.user; } next();
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
                            if (!req.discord_session) { req.discord_session = {}; }
                            req.discord_session.connections = connections;

                            // Complete
                            next();
                            return;

                        }).catch(err => {
                            if (req.discord_session) { delete req.discord_session.connections; } next();
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
                            if (!req.discord_session) { req.discord_session = {}; }
                            req.discord_session.guilds = guilds;

                            // Complete
                            next();
                            return;

                        }).catch(err => {
                            if (req.discord_session) { delete req.discord_session.guilds; } next();
                            return;
                        });
                    } else { next(); }

                    // Complete
                    return;

                }

            }

        };

        // Complete
        return final_functions;

    }

    // Nope
    else {
        throw new Error('Invalid Config Value!');
    }

};