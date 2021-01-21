// Test Modules Prepare
const discordAuth = require('../index');
const express = require('express');
const http_status = require('@tinypudding/puddy-lib/http/HTTP-1.0');
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
tinyAuth.discordScope = ["identify", "email", "guilds", "guilds.join", "connections", "gdm.join", "applications.builds.read", "applications.store.update", "applications.entitlements", "relationships.read"];
/* "applications.commands" */

const sessionVar = 'access_token';

// Login
app.get('/login', (req, res) => {

    // Result
    discordAuth.login(req, res,
        {

            // Error
            errorCallback: function (err) {
                return res.json(err);
            },

            // Auth
            auth: tinyAuth,

            // Query
            query: { redirect: 'redirect' },

            // State
            state: {
                csrfToken: '',
                redirect: ''
            }

        }, (getSessionFromCookie(req, sessionVar)),
    );

    return;

});

// Logout
app.get('/logout', (req, res) => {

    // Result
    discordAuth.logout(req, res,
        {

            // Auth
            auth: {
                csrfToken: ''
            },

            // Query
            query: {
                csrfToken: 'csrfToken',
                redirect: 'redirect'
            },

            // Auth
            auth: tinyAuth,

            // Access Token
            access_token: req.session[sessionVar]

        }, (getSessionFromCookie(req, sessionVar)),
    ).then(result => {

        // Complete
        console.log(result);
        result.fn();
        return;

    }).catch(err => {

        // Complete
        console.error(err);
        return http_status.send(res, err.code);

    });

    // Complete
    return;

});

// Redirect
app.get('/redirect', bodyParseN, (req, res) => {

    // Result
    discordAuth.redirect(req, res,
        {

            // Auth
            auth: tinyAuth,

            // Query
            query: { redirect: 'redirect' },

            // State
            state: {
                csrfToken: '',
                redirect: ''
            }

        }, (getSessionFromCookie(req, sessionVar)),
    ).then(result => {

        // Complete
        if (result.newSession) {
            req.session[sessionVar] = result.token.access_token;
            res.json(result);
        } else {
            res.redirect('/');
        }
        return;

    }).catch(err => {

        // Complete
        console.error(err);
        return http_status.send(res, err.code);

    });

    // Complete
    return;

});

// Test Page
app.get('/test', (req, res) => {
    res.send('Test Success!');
});

// Test Page
app.get('/', (req, res) => {

    // Result
    if (typeof req.session[sessionVar] === "string") {
        discordAuth.api.getUser(req.session[sessionVar]).then(result => {

            // Complete
            res.json(result);
            return;

        }).catch(err => {

            // Complete
            console.error(err);
            return http_status.send(res, err.response.status);

        });
    }

    // Nope
    else {
        res.send('No Account Detect');
    }

});

// Listen the Server
app.listen(port, () => {

    console.group(`Discord Code Test is being executed.`);
    console.log(`Main URL: http://localhost:${port}`);
    console.log(`Redirect URL to insert in the Discord Bot: ${tinyAuth.redirect}`);
    console.groupEnd();

    console.group('Account URLs');
    console.log(`Login: http://localhost:${port}/login`);
    console.log(`Logout: http://localhost:${port}/logout`);
    console.groupEnd();

    console.group('Account URLs with Redirect');
    console.log(`Login: http://localhost:${port}/login?redirect=test`);
    console.log(`Logout: http://localhost:${port}/logout?redirect=test`);
    console.groupEnd();

})