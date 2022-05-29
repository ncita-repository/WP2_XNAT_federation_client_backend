const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');
const base64url = require('base64url');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

// keys for JWT verification
const jwks = require('../jwks.json');

// options for hitting this route are: 
// in the callback from cognito
// after authenticating, searching and returning here
// bypassing authentication
// do things in this order:
// 
// does the current request have a code from Cognito?
//    if so: check state paramater, get tokens
//    if not: continue to the next function
// 
// does the current request have tokens?
//    if so: continue to next function
//    if not: stop

// check for a code in the query string, and get tokens if necessary
const getTokens = async (req, res, next) => {

  // get the parameters out from the querystring
  const qryStr = new URL(`REDIRECT_URI_HERE${req.url}`).searchParams;
  //console.log(qryStr);

  // if there's a code, check state and get tokens, otherwise, move on
  if (qryStr.has('code')) {
    if (qryStr.has('state')) {
      if (qryStr.get('state') == req.session.state) {
        
        // call Cognito token endpoint
        const basicAuth = base64url(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
        const code = qryStr.get('code');
        try {
          const tokens = await axios({
            method: 'post',
            url: `${process.env.AUTH_DOMAIN}/oauth2/token`,
            data: qs.stringify({
              grant_type: 'authorization_code',
              redirect_uri: 'REDIRECT_URI_HERE',
              code: code
            }),
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'authorization': `Basic ${basicAuth}`
            }
          })

          // add tokens to session
          req.session.ac_token = tokens.data.access_token;
          req.session.id_token = tokens.data.id_token;
          next();

        } catch (error) {
          console.log(error);
        }
      } else {
        res.send(`state doesn't match`);
      }
    } else {
      res.redirect(`no state found`);
    } 
  } else {
    next();
  }
}

// check for tokens and verify if present
const verifyTokens = (req, res, next) => {

  // get tokens from session
  const acTokenString = req.session.ac_token;
  const idTokenString = req.session.id_token;

  if (!(acTokenString == null) && !(idTokenString == null)) {

    // decode id and access tokens
    const acTokenDecoded = jwt.decode(acTokenString, {complete: true});
    const idTokenDecoded = jwt.decode(idTokenString, {complete: true});

    // set request username
    req.session.user = acTokenDecoded.payload.username;

    // identify the key used for access token
    let jwkAc = [];
    if (acTokenDecoded.header.kid == jwks.keys[0].kid) {
      jwkAc = jwks.keys[0];
    } else {
      jwkAc = jwks.keys[1];
    }

    // identify the key used for ID token
    let jwkId = [];
    if (idTokenDecoded.header.kid == jwks.keys[0].kid) {
      jwkId = jwks.keys[0];
    } else {
      jwkId = jwks.keys[1];
    }

    // convert to pem for verification
    const pemId = jwkToPem(jwkId);
    const pemAc = jwkToPem(jwkAc);

    // verify the token in synchronous fashion
    // additional verification (of claims) here
    try {
      const verifiedIdToken = jwt.verify(idTokenString, pemId, { algorithms: ['RS256'] });
      try {
        const verifiedAcToken = jwt.verify(acTokenString, pemAc, { algorithms: ['RS256'] });
        next();
      } catch (err) {
        console.log(err);
        req.session.destroy((err) => {
          console.log(err);
        })
        res.send(`unverified access token`);
      }
    } catch(err) {
      console.log(err);
      req.session.destroy((err) => {
        console.log(err);
      })
      res.send(`unverified id token`);
    }
  } else {
    req.session.destroy((err) => {
      console.log(err);
    })
    res.send(`missing id or access token`);
  }
}

const renderDashboard = (req, res) => {

  // TODO: redirect to frontend
  // TODO: with a session cookie
  res.redirect('AUTH_REDIRECT_HERE');
  //res.send(`success! so far...`);

}

// set up router to use the middleware functions
router.use(getTokens);
router.use(verifyTokens);
router.use(renderDashboard);

module.exports = router;
