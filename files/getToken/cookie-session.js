module.exports = function (req, where) {
    
    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Get Token
    if(objType(req.session, 'object') && typeof req.session[where] === "string") {
        return req.session[where];
    } 
    
    // Nope
    else {
        return null;
    }

};