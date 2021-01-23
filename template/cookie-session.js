module.exports = function (cfg, app) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Config
    if (objType(cfg, 'object')) {

        // Modules
        const _ = require('lodash');

        // Create Settings
        const bodyParser = _.defaultsDeep({}, cfg.bodyParser, {
            module: null,
            used: false
        });

        // Test Modules Prepare
        const discordAuth = require('../index');
        const getSessionFromCookie = require('../get/cookie-session');
        let bodyParse = null;

        // Prepare Body Parser
        if (bodyParser.used) {
            if (bodyParser.module) {

                bodyParser.module = require('body-parser');
                bodyParse = bodyParser.module.urlencoded({     // to support URL-encoded bodies
                    extended: true
                });

            }
        }

    }

    // Complete
    return;

};