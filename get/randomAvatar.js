// Avatar Discord Generator
module.exports = function (value = null, url = 'https://cdn.discordapp.com/embed/avatars/') {
    
    // Random
    if (typeof value !== "number" && typeof value !== "string") {
        return url + require('@tinypudding/puddy-lib/libs/dice').vanilla(4) + '.png';
    }

    // Nope
    else {
        return url + 'https://cdn.discordapp.com/embed/avatars/' + value + '.png';
    }

};