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

// Start Firebase
require('../index')({ type: 'firebase', app: app, cfg: {} });