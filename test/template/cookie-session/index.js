module.exports = function (webtype = 'default', extraApp) {

    // Test Modules Prepare
    const discordAuth = require('../../../template/cookie-session');
    const express = require('express');
    const app = express();

    // Add Helmet
    const helmet = require('helmet');
    app.use(helmet());

    // Prepare Cookie Session
    const cookieSession = require('cookie-session');
    const tinySession = cookieSession({
        keys: ['0000000000', '11111111111']
    });

    // Session Vars
    const sessionVars = {
        access_token: 'access_token',
        token_expires_in: 'token_expires_in'
    };

    app.use(tinySession);

    // Port
    const port = 3000;

    // Auth
    const tinyAuth = require('../../auth.json');
    tinyAuth.discordScope = ["identify", "email"];

    // Result
    const authOptions = { auth: tinyAuth, vars: sessionVars };

    // Firebase
    if (webtype === "firebase") { authOptions.firebase = extraApp; }

    // Send Auth
    const dsFunctions = discordAuth(app, authOptions);

    // Homepage
    app.get('/', (req, res) => {
        res.send('Tiny Homepage :3');
        return;
    });

    // Get Session
    app.get('/session', (req, res) => {
        return res.json(req.session);
    });

    // User Page
    app.get('/user', dsFunctions.getUser, (req, res) => {

        // Result
        if (req.discord_session && req.discord_session.user) {
            res.json(req.discord_session.user);
        }

        // Nope
        else {
            res.send('No Account Detect');
        }

        // Complete
        return;

    });

    app.get('/user/connections', dsFunctions.getUserConnections, (req, res) => {

        // Result
        if (req.discord_session && req.discord_session.connections) {
            res.json(req.discord_session.connections);
        }

        // Nope
        else {
            res.send('No Account User Detect');
        }

        // Complete
        return;

    });

    app.get('/user/guilds', dsFunctions.getUserGuilds, (req, res) => {

        // Result
        if (req.discord_session && req.discord_session.guilds) {
            res.json(req.discord_session.guilds);
        }

        // Nope
        else {
            res.send('No Account Guilds Detect');
        }

        // Complete
        return;

    });

    app.get('/user/all', dsFunctions.getUserConnections, dsFunctions.getUser, dsFunctions.getUserGuilds, (req, res) => {

        // Result
        if (req.discord_session) {
            res.json(req.discord_session);
        }

        // Nope
        else {
            res.send('No Account Connections Detect');
        }

        // Complete
        return;

    });

    // Test Refresh
    app.get('/session/refresh', (req, res) => {

        // Result
        if (typeof req.session[sessionVars.access_token] === "string") {

            // Expire In
            const moment = require('moment-timezone');
            req.session[sessionVars.token_expires_in] = moment.tz('Universal').add(10, 'minute').format();
            res.json(req.session);

        }

        // Nope
        else {
            res.send('No Account Detect');
        }

        // Complete
        return;

    });

    // Test Logout
    app.get('/session/logout', (req, res) => {

        // Result
        if (typeof req.session[sessionVars.access_token] === "string") {

            // Expire In
            const moment = require('moment-timezone');
            req.session[sessionVars.token_expires_in] = moment.tz('Universal').add(-10, 'minute').format();
            res.json(req.session);

        }

        // Nope
        else {
            res.send('No Account Detect');
        }

        // Complete
        return;

    });

    // Error Pages
    app.post('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (POST)' }); });
    app.get('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (GET)' }); });

    // Listen the Server
    app.listen(port, () => {

        console.log(`Website Mode: ${webtype}`);

        console.log(`Homepage: http://localhost:${port}/`);
        console.log(`User Page: http://localhost:${port}/user`);
        console.log(`Session Page: http://localhost:${port}/session`);
        console.log(`Session Logout Page: http://localhost:${port}/session/logout`);
        console.log(`Session Refresh Page: http://localhost:${port}/session/refresh`);
        console.log(`Login: http://localhost:${port}/login`);
        console.log(`Logout: http://localhost:${port}/logout`);

    });

    // Complete
    return;

};