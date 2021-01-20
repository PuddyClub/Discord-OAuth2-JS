// Test Modules Prepare
const discordAuth = require('../index');
const express = require('express');
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

// Discord Login
app.get('/', (req, res) => {

    return discordAuth.login(req, res, cfg, existSession);

});

// Others
app.post('*', bodyParseN, (req, res) => {
    return startPage(botOwner, bot, tinyCfg, res, req, db, isDebug, (defaultPage, page, ip, moment) => {
        return domainSelector(req, res, defaultPage, page, ip, moment);
    });
});

// Listen the Server
app.listen(port, () => {
    console.log(`Discord Code Test is being executed in http://localhost:${port}`);
})