/* 

    This is a test file. You need rename the file "auth_example.json" to "auth.json".
    For faster results testing, we recommend using the "JSON Viewer Pro" extension in your browser.
    https://github.com/rbrahul/Awesome-JSON-Viewer
    https://chrome.google.com/webstore/detail/json-viewer-pro/eifflpmocdbdmepbjaopkkhbfmdgijcc 

*/

// Test Modules Prepare
const objType = require('@tinypudding/puddy-lib/get/objType');
const discordAuth = require('../index');
const express = require('express');
const getSessionFromCookie = require('../get/cookie-session');
const app = express();

// Prepare Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const bodyParseN = bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
});

// Add Helmet
const helmet = require('helmet');
app.use(helmet());

// Prepare Cooke Session
const cookieSession = require('cookie-session');
const tinySession = cookieSession({
    keys: ['0000000000', '11111111111']
});

app.use(tinySession);

// Port
const port = 3000;

// Test Config
const tinyAuth = require('./auth.json');
tinyAuth.discordScope = ["identify", "email", "guilds", "guilds.join", "connections", "gdm.join"];
/* "applications.commands" */

// Session Vars
const sessionVars = {
    access_token: 'access_token',
    expires_in: 'expires_in',
    refresh_token: 'refresh_token',
    token_type: 'token_type',
    scope: 'scope'
};

// Crypto Values
const tinyCrypto = require('../get/crypto/default.json');

// Login
app.get('/login', (req, res) => {

    // Result
    discordAuth.login(req, res,
        {

            // Error
            errorCallback: function (err) {
                return res.json(err);
            },

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
                csrfToken: '',
                redirect: ''
            }

        }, (getSessionFromCookie(req, sessionVars.access_token)),
    );

    // Complete
    return;

});

// Webhook
app.get('/webhook', (req, res) => {

    // Result
    discordAuth.login(req, res,
        {

            // Error
            errorCallback: function (err) {
                return res.json(err);
            },

            // Crypto
            crypto: tinyCrypto,

            // Auth
            auth: tinyAuth,

            // Type
            type: 'webhook',

            // Query
            query: { redirect: 'redirect' },

            // State
            state: {
                csrfToken: '',
                redirect: ''
            }

        }, (getSessionFromCookie(req, sessionVars.access_token)),
    );

    // Complete
    return;

});

// Logout
app.get('/logout', (req, res) => {

    // Result
    discordAuth.logout(req, res, req.session,
        {

            // Query
            query: {
                csrfToken: 'csrfToken',
                redirect: 'redirect'
            },

            // Auth
            auth: tinyAuth,

            // Access Token
            access_token: req.session[sessionVars.access_token]

        }, (getSessionFromCookie(req, sessionVars.access_token)),
    ).then(result => {

        // Complete
        req.session = null;
        res.json(result);
        return;

    }).catch(err => {

        // Complete
        res.json(err);
        return;

    });

    // Complete
    return;

});

// Redirect
app.get('/redirect', bodyParseN, (req, res) => {

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
                csrfToken: '',
                redirect: ''
            }

        }, (getSessionFromCookie(req, sessionVars.access_token)),
    ).then(result => {

        // New Session Result
        if (result.state.type === "login" && result.newSession) {
            req.session[sessionVars.access_token] = result.tokenRequest.access_token;
            req.session[sessionVars.expires_in] = result.tokenRequest.expires_in;
            req.session[sessionVars.refresh_token] = result.tokenRequest.refresh_token;
            req.session[sessionVars.token_type] = result.tokenRequest.token_type;
            req.session[sessionVars.scope] = result.tokenRequest.scope;
            res.json(result);
        } 
        
        // Webhook Result
        else if (result.state.type === "webhook") {
            res.json(result);
        }

        // Nothing
        else {
            res.redirect('/');
        }
        return;

    }).catch(err => {

        // Complete
        res.json(err);
        return;

    });

    // Complete
    return;

});

// Refresh Token
app.get('/refresh', bodyParseN, (req, res) => {

    // Result
    discordAuth.refreshToken(req,
        {

            // Redirect
            redirect: '',

            // Auth
            auth: tinyAuth,

            // Refresh Token
            refresh_token: req.session[sessionVars.refresh_token]

        }, (getSessionFromCookie(req, sessionVars.access_token)),
    ).then(result => {

        // Complete
        if (result.refreshed) {
            req.session[sessionVars.access_token] = result.tokenRequest.access_token;
            req.session[sessionVars.expires_in] = result.tokenRequest.expires_in;
            req.session[sessionVars.refresh_token] = result.tokenRequest.refresh_token;
            req.session[sessionVars.token_type] = result.tokenRequest.token_type;
            req.session[sessionVars.scope] = result.tokenRequest.scope;
        }

        res.json(result);

        return;

    }).catch(err => {

        // Complete
        res.json(err);
        return;

    });

    // Complete
    return;

});

// Test Page
app.get('/test', (req, res) => {
    res.send('Test Success!');
});

// Homepage
app.get('/', (req, res) => {
    res.send('Tiny Homepage :3');
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

// User Guilds
app.get('/user/guilds', (req, res) => {

    // Result
    if (typeof req.session[sessionVars.access_token] === "string") {
        discordAuth.api.getUserGuilds(req.session[sessionVars.access_token]).then(result => {

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

// User Connections
app.get('/user/connections', (req, res) => {

    // Result
    if (typeof req.session[sessionVars.access_token] === "string") {
        discordAuth.api.getUserConnections(req.session[sessionVars.access_token]).then(result => {

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

// Guild
app.get('/guild', (req, res) => {

    // Result
    if (((typeof req.query.id === "string" && req.query.id.length > 0) || typeof req.query.id === "number" && !isNaN(req.query.id))) {
        discordAuth.api.getGuildWidget(req.query.id).then(result => {

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
        res.json({ code: 500, message: 'Invalid Guild Widget Value!' });
        return;
    }

});

// Error Pages
app.post('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (POST)' }); });
app.get('*', (req, res) => { res.status(404); return res.json({ code: 404, message: 'Page Not Found! (GET)' }); });

// Listen the Server
app.listen(port, () => {

    console.group(`Discord Code Test is being executed.`);
    console.log(`Main URL: http://localhost:${port}`);
    console.log(`Redirect URL to insert in the Discord Bot: ${tinyAuth.redirect}`);
    console.groupEnd();

    console.group('Account URLs');
    console.log(`Guild: http://localhost:${port}/guild?id=`);
    console.log(`Login: http://localhost:${port}/login`);
    console.log(`Webhook: http://localhost:${port}/webhook`);
    console.log(`Logout: http://localhost:${port}/logout`);
    console.log(`Refresh Token: http://localhost:${port}/refresh`);
    console.log(`User Page: http://localhost:${port}/user`);
    console.log(`User Guilds: http://localhost:${port}/user/guilds`);
    console.log(`User Connections: http://localhost:${port}/user/connections`);
    console.groupEnd();

    console.group('Account URLs with Redirect');
    console.log(`Login: http://localhost:${port}/login?redirect=test`);
    console.log(`Logout: http://localhost:${port}/logout?redirect=test`);
    console.log(`Refresh Token: http://localhost:${port}/refresh?redirect=test`);
    console.log(`Webhook: http://localhost:${port}/webhook?redirect=test`);
    console.groupEnd();

})