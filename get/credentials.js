module.exports = function (tinyAuth) {
    
    // Result
    const result = Buffer.from(`${tinyAuth.client_id}:${tinyAuth.client_secret}`).toString("base64");
    return result;

};