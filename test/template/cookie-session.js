// Test Modules Prepare
const discordAuth = require('../../template/cookie-session');
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
    access_token: 'access_token'
};

app.use(tinySession);

// Port
const port = 3000;

// Auth
const tinyAuth = require('../auth.json');
tinyAuth.discordScope = ["identify"];

// Result
discordAuth(app, { auth: tinyAuth, vars: sessionVars });

// Homepage
app.get('/', (req, res) => {
    res.send('Tiny Homepage :3');
});

// Get Session
app.get('/session', (req, res) => {
    return res.json(req.session);
});

// User Page
app.get('/user', (req, res) => {

    // Result
    if (typeof req.session[sessionVars.access_token] === "string") {
        discordAuth.api.getUser(req.session[sessionVars.access_token]).then(result => {

            // Complete
            res.json(result);
            return;

        }).catch(err => {

            // Complete
            res.json(err);
            return;

        });
    }

    // Nope
    else {
        res.send('No Account Detect');
    }

});

// Error Pages
app.post('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (POST)' }); });
app.get('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (GET)' }); });

// Listen the Server
app.listen(port, () => {

    console.log(`Homepage: http://localhost:${port}/`);
    console.log(`User Page: http://localhost:${port}/user`);
    console.log(`Login: http://localhost:${port}/login`);
    console.log(`Logout: http://localhost:${port}/logout`);

});