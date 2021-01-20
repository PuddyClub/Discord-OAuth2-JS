
module.exports = async function (req, res, cfg, callback) {
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
            discordSecret: ''
        });

        // Detect Query
        if (objType(req.query, 'object')) {

            try {

                // Get State
                if (typeof req.query.state === "string") {
                    req.query.state = JSON.parse(req.query.state);
                }

                // Check Session
                if (req.query.state.csrfToken && req.query.state.csrfToken === req.session.csrfToken) {
                    if (!req.session.access_token) {

                        if (!req.query.code) throw new Error('NoCodeProvided');

                        // Discord API
                        const discord_api = require('./api');

                        const code = req.query.code;
                        let json = await discord_api.getToken({
                            client_id: tinyCfg.discordID,
                            client_secret: tinyCfg.discordSecret,
                            code: code,
                            redirect_uri: tinyCfg.redirect,
                            scope: tinyCfg.discordScope.join(' ')
                        });

                        // Check Token
                        if (json.data && ((typeof json.data.access_token === "string") || (typeof json.data.access_token === "number"))) {

                            // Get JSON
                            json = json.data;

                            // Get User
                            dsUser = await discord_api.getUser(json.access_token);

                            // User Verified
                            if (dsUser.data && dsUser.data.verified) {

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

                                // Redirect
                                if (typeof callback !== "function") {
                                    res.status(401); return res.render('error', { code: 401, text: 'Discord account need to be verified.' });
                                }

                                // Custom Redirect
                                else {
                                    return callback(json, dsUser, json.access_token);
                                }

                            }

                        } else {
                            res.status(401); return res.render('error', { code: 401, text: 'Incorrect Code 2' });
                        }

                    } else {
                        res.status(401); return res.render('error', { code: 401, text: 'Incorrect Code 1' });
                    }
                } else {
                    res.status(401); return res.render('error', { code: 401, text: 'Incorrect csrfToken' });
                }

            } catch (e) {
                console.error(e);
                res.status(500); return res.render('error', { code: 500, text: 'Error Redirect' });
            }

        }

        // Nope
        else {
            reject(new Error('Invalid Query URL!'));
        }

        // Complete
        return;

    });
}