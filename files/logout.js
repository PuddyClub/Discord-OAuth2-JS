
module.exports = async function(req, res){
    
    if (req.session.access_token) {

        const discord_api = require('../libs/discord_api');
        await discord_api.revokeToken(req.session.access_token);

        req.session = null;

        // Redirect
        if(req.query.redirect){

            if(req.query.redirect.startsWith('/')){
                req.query.redirect = req.query.redirect.substring(1);
            }

        } else {
            req.query.redirect = '';
        }

        return res.redirect('/' + req.query.redirect);

    } else {
        res.status(404); return res.render('error', { code: 404, text: 'Not Found' });
    }

}