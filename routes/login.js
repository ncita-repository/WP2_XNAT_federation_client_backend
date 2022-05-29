const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// pass Cognito login url to login page
router.get('/', (req, res) => {

    // state parameter per session
    const stateParam = crypto.randomBytes(10).toString('hex');
    req.session.state = stateParam;
    //console.log(req.session);

    // make URL
    // note: could use the /oauth2/authorize endpoint here, as well
    // the /oauth2/authorize endpoint allows PKCE
    const urlLogin = new URL(`${process.env.AUTH_DOMAIN}/oauth2/authorize`);
    urlLogin.searchParams.append('response_type', 'code');
    urlLogin.searchParams.append('client_id', `${process.env.CLIENT_ID}`);
    urlLogin.searchParams.append('redirect_uri', 'REDIRECT_URI_HERE');
    urlLogin.searchParams.append('state', stateParam);
    urlLogin.searchParams.append('scope', 'openid profile ETC_SCOPES');
    //console.log(urlLogin);
  
    res.redirect(urlLogin);
})

// export
module.exports = router;
