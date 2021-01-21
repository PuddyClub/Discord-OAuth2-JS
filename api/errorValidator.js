module.exports = function (data) {

    // OBJ Type
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Result
    const result = { data: null, error: null };

    // Exist Object
    if (objType(data, 'object')) {

        // Success
        if (typeof data.message !== "string" || data.message !== "401: Unauthorized") {
            result.data = data;
        }

        // Nope
        else {
            result.error = { code: 401, message: data.message };
        }

    }

    // Nope
    else {
        result.error = { code: 500, message: 'Invalid HTTP Result!' };
    }

    // Complete
    return result;

};