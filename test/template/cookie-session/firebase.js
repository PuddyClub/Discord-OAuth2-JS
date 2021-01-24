// Prepare Firebase
const tinyCfg = require('../../firebase_config.json');
const firebase = require('@tinypudding/firebase-lib');

// Get Credentials
tinyCfg.firebase.credential = admin.credential.cert(require('../../firebase.json'));

// Start Firebase
if (tinyCfg.firebase) {
    firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);
} else {
    firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);
}

// App
const app = firebase.get(tinyCfg.options.id);

// Start Firebase
require('./index')('firebase', app);