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

// Result
discordAuth(app, {

});

// Listen the Server
app.listen(port, () => {

    console.log(`Login: http://localhost:${port}/login`);
    console.log(`Login: http://localhost:${port}/logout`);

});