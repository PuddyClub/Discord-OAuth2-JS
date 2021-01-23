// Test Modules Prepare
const discordAuth = require('../../template/cookie-session');

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

// Auth
const tinyAuth = require('../auth.json');
tinyAuth.discordScope = ["identify"];

// Result
discordAuth(app, { auth: tinyAuth });

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


// Listen the Server
app.listen(port, () => {

    console.log(`Homepage: http://localhost:${port}/`);
    console.log(`User Page: http://localhost:${port}/user`);
    console.log(`Login: http://localhost:${port}/login`);
    console.log(`Logout: http://localhost:${port}/logout`);

});