// Prepare Firebase
const tinyCfg = require('../../../firebase_config.json');
const firebase = require('@tinypudding/firebase-lib');

// Get Credentials
const admin = require('firebase-admin');
tinyCfg.firebase.credential = admin.credential.cert(require('../../../firebase.json'));

// Start Firebase
if (tinyCfg.firebase) {
    firebase.start(admin, tinyCfg.options, tinyCfg.firebase);
} else {
    firebase.start(admin, tinyCfg.options, tinyCfg.firebase);
}

// App
const app = firebase.get(tinyCfg.options.id);

// Firebase Config
const firebaseCfg = JSON.stringify(require('./html_values.json'));

// Start Firebase
require('../index')({
    type: 'firebase', app: app, cfg: {

        // Redirect
        redirect: {

            /* 
            
                data.functions
                data.token
                data.redirect
            
            */

            /* Login */
            login: function (data, req, res) {
                return res.send(
                    require('fs').readFileSync(require('path').join(__dirname, './login.html'), "utf8")
                        .replace('{{firebase_cfg}}', firebaseCfg)
                        .replace('{{start_login}}', data.functions.run)
                        .replace('{{token}}', data.token)
                        .replace('{{key}}', data.key)
                        .replace('{{redirect_url}}', data.redirect)
                );
            },

            /* Logout */
            logout: function (data, req, res) {
                return res.send(
                    require('fs').readFileSync(require('path').join(__dirname, './logout.html'), "utf8")
                        .replace('{{firebase_cfg}}', firebaseCfg)
                        .replace('{{start_logout}}', data.functions.run)
                        .replace('{{token}}', data.token)
                        .replace('{{key}}', data.key)
                        .replace('{{original_key}}', data.originalKey)
                        .replace('{{redirect_url}}', data.redirect)
                );
            }

        }

    }
});