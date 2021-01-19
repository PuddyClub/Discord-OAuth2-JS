
module.exports = async function (isDebug, req, res, tinyCfg, data) {

    if (!req.session.access_token) {

        // Redirect
        let redirect
        if (isDebug) {
            redirect = encodeURIComponent('http://localhost:' + tinyCfg.port + '/redirect');
        } else {
            redirect = encodeURIComponent('https://' + tinyCfg.hostname + "/redirect");
        }

        // Scopes
        let tinyscopes = '';

        if (Array.isArray(tinyCfg.discord.scope)) {
            for (const item in tinyCfg.discord.scope) {
                if (tinyscopes) {
                    tinyscopes += '%20';
                }
                tinyscopes += tinyCfg.discord.scope[item];
            }
        }

        // Extra Data
        if (data) {
            data.csrfToken = req.session.csrfToken;
        } else {
            data = {
                csrfToken: req.session.csrfToken
            }
        }

        // Redirect
        if(req.query.redirect){

            if(req.query.redirect.startsWith('/')){
                req.query.redirect = req.query.redirect.substring(1);
            }

            data.redirect = req.query.redirect;

        }

        data = encodeURIComponent(JSON.stringify(data));

        // Redirect URL
        return res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${tinyCfg.discord.id}&scope=${tinyscopes}&response_type=code&redirect_uri=${redirect}&state=${data}`);

    } else {
        return res.redirect('/');
    }

}