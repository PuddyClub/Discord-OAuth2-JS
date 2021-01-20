
module.exports = async function (req, res, cfg, existSession) {
    return new Promise(function (resolve, reject) {

        // Modules
        const _ = require('lodash');
        const objType = require('@tinypudding/puddy-lib/get/objType');
        const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, cfg.auth, {
            redirect: 'http://localhost/redirect',
            discordScope: [],
            discordID: '',
            discordSecret: '',
            needVerification: false,
            getUser: true
        });

        // Detect Query
        if (objType(req.query, 'object')) {

            // Get State
            if (typeof req.query.state === "string") {
                try {
                    req.query.state = JSON.parse(req.query.state);
                } catch (err) {
                    req.query.state = {};
                }
            } else {
                req.query.state = {};
            }

            // Detect State
            if (objType(req.query.state, 'object')) {

                // Check Session
                if (typeof tinyCfg.csrfToken !== "string" || tinyCfg.csrfToken.length < 1 || (typeof req.query.state.csrfToken === "string" && req.query.state.csrfToken === tinyCfg.csrfToken)) {
                    if (!existSession) {

                        if (!req.query.code) throw new Error('NoCodeProvided');

                        // Discord Token
                        const getToken = require('./api/getToken');

                        const code = req.query.code;
                        getToken({
                            client_id: tinyCfg.discordID,
                            client_secret: tinyCfg.discordSecret,
                            code: code,
                            redirect_uri: tinyCfg.redirect,
                            scope: tinyCfg.discordScope.join(' ')
                        })

                            // Success
                            .then(json => {

                                // Check Token
                                if (json.data && (typeof json.data.access_token === "string" || typeof json.data.access_token === "number")) {

                                    // Get JSON
                                    json = json.data;



                                    // Discord Token
                                    const getUser = require('./api/getUser');

                                    if (tinyCfg.getUser) {

                                        // Get User
                                        getUser(json.access_token)

                                            // Get User
                                            .then(dsUser => {

                                                // User Verified
                                                if ((objType(dsUser.data, 'object') && dsUser.data.verified) || !tinyCfg.needVerification) {

                                                    // Get Data
                                                    dsUser = dsUser.data;

                                                    // Redirect
                                                    if (typeof callback !== "function") {

                                                        req.session.access_token = json.access_token;
                                                        if (typeof req.query.state.redirect !== "string") {
                                                            return res.redirect('/');
                                                        } else {
                                                            return res.redirect('/' + req.query.state.redirect);
                                                        }

                                                    }

                                                    // Custom Redirect
                                                    else {
                                                        return callback(json, dsUser, json.access_token);
                                                    }

                                                }

                                                // Ops!
                                                else {
                                                    reject({ code: 401, message: 'Discord account need to be verified.' });
                                                }

                                            })

                                            // Fail
                                            .catch(err => {
                                                reject({ code: err.response.status, message: err.message });
                                            });

                                    }

                                } else {
                                    reject({ code: 500, message: 'Incorrect User Data!' });
                                }

                            })

                            // Fail
                            .catch(err => {
                                reject({ code: err.response.status, message: err.message });
                            });

                    } else {
                        resolve({ newSession: false });
                    }
                } else {
                    reject({ code: 401, message: 'Incorrect csrfToken!' });
                }

            }

            // Nope
            else {
                reject({ code: 401, message: 'Invalid State Query!' });
            }

        }

        // Nope
        else {
            reject({ code: 401, message: 'Invalid Query URL!' });
        }

        // Complete
        return;

    });
}