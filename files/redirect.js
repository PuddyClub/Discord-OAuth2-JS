
module.exports = async function (isDebug, req, res, tinyCfg, callback) {

    try {

        // Get State
        if (typeof req.query.state === "string") {
            req.query.state = JSON.parse(req.query.state);
        }

        // Check Status
        if (req.query.state.checkStatus) {

            // Create Crypto
            const crypto = require('crypto');
            const decipher = crypto.createDecipher(tinyCfg.crypto.algorithm, tinyCfg.discord.secret);

            // Decrypt
            req.query.code = decipher.update(req.query.code, tinyCfg.crypto.type2, tinyCfg.crypto.type);
            req.query.code += decipher.final(tinyCfg.crypto.type);

            req.query.state.checkStatus = decipher.update(req.query.state, tinyCfg.crypto.type2, tinyCfg.crypto.type);
            req.query.state.checkStatus += decipher.final(tinyCfg.crypto.type);

        }

        // Check Session
        if (
            (req.query.state.csrfToken && req.query.state.csrfToken === req.session.csrfToken) ||
            req.query.state.checkStatus === tinyCfg.crypto.code
        ) {
            if (!req.session.access_token) {

                let redirect;

                if (isDebug) {
                    redirect = 'http://localhost:' + tinyCfg.port + '/redirect';
                } else {
                    redirect = 'https://' + tinyCfg.hostname + "/redirect";
                }

                if (!req.query.code) throw new Error('NoCodeProvided');

                // Discord API
                const discord_api = require('../libs/discord_api');

                const code = req.query.code;
                let json = await discord_api.getToken({
                    client_id: tinyCfg.discord.id,
                    client_secret: tinyCfg.discord.secret,
                    code: code,
                    redirect_uri: redirect,
                    scope: tinyCfg.discord.scope.join(' ')
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