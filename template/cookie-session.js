module.exports = function (cfg, app) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Modules
    const _ = require('lodash');

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, cfg, {
       
        // Body Parser
        bodyParser: {
            module: null,
            used: false
        }

    });

    // Test Modules Prepare
    const discordAuth = require('../index');
    const getSessionFromCookie = require('../get/cookie-session');
    let bodyParse = null;

    // Prepare Body Parser
    if(tinyCfg.bodyParser.used) {
        if(tinyCfg.bodyParser.module) {
        
            tinyCfg.bodyParser.module = require('body-parser');
            bodyParse = tinyCfg.bodyParser.module.urlencoded({     // to support URL-encoded bodies
                extended: true
            });

        }
    }

};