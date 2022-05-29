const jwt = require('jsonwebtoken');
const axios = require('axios');

// this ensures the request has valid XNAT session(s)
const getUserXnatSession = (req, res, next) => {

  // xnats is a list of all available XNATs
  const xnats = require('IMPORT_XNAT_JSON');

  // get the ID token from the session
  const idTokenString = req.session.id_token;
  const acTokenString = req.session.ac_token;

  // decode id token
  const idTokenDecoded = jwt.decode(idTokenString, {complete: true});

  // start accumulating user's XNATs
  let userXnatNames = [];
  let userXnatUrls = [];
  let userUsernames = [];
  for (let x in xnats) {
    console.log([`custom:XNAT_${x}`]);
    if ([`custom:XNAT_${x}`] in idTokenDecoded.payload) {
      userXnatNames.push(x);
      userXnatUrls.push(xnats[x]);
      userUsernames.push(idTokenDecoded.payload[`custom:XNAT_${x}`]);
    }
  }
  console.log(userXnatNames);
  console.log(userXnatUrls);
  console.log(userUsernames);

  // make an array of axios requests to user's XNATs
  let axReqs = [];
  for (let i = 0; i < userXnatUrls.length; i++) {

    // define things to put in the request
    let url = `${userXnatUrls[i]}/data/JSESSION`;

    //console.log(`getting from XNAT ${url}`);

    const headers = {
        'Authorization': `Bearer ${acTokenString}`
    };
    
    // construct the request
    let currentRequest = axios.post(url, [], {
        headers: headers
    });

    //console.log(currentRequest);

    // and add to the request array
    axReqs.push(currentRequest);
  }

  req.session.userXnatNames = userXnatNames;
  req.session.userXnatUrls = userXnatUrls;
  req.session.userUsernames = userUsernames;

  console.log(axReqs);

  // now make all of the requests concurrently
  Promise.all(axReqs).then(responseArr => {

    // start an array to append values to
    let xnatSessionIds = [];

    for (let i = 0; i < responseArr.length; i++) {
        xnatSessionIds.push(responseArr[i].data);
    }

    // add these sessions to the stored client session
    console.log(xnatSessionIds);
    req.session.xnatSessions = xnatSessionIds;   

    next();

  }).catch(err => {
      console.error(err);
      res.send('Error making XNAT requests for sessions');
  })
}

module.exports = getUserXnatSession;