const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const getUserXnatSession = require('../utilities/get-user-xnat-session');

const getUserProjects = (req, res) => {

  // available on the req.session object:
  // req.session.userXnatNames
  // req.session.userXnatUrls
  // req.session.userUsernames
  // req.session.xnatSessions

  const userXnatNames = req.session.userXnatNames;
  const userXnatUrls = req.session.userXnatUrls;
  const userSessionIds = req.session.xnatSessions;
  const pythonArgs = userXnatUrls.concat(userSessionIds, userXnatNames);
  console.log(pythonArgs);

  // in python options,
  // python path is the pipenv virtual env path
  // and args should be [url_1, url_2, url_n, sessionId_1, sessionId_2, sessionId_n]
  const pythonOptions = {
    mode: 'json',
    pythonPath: 'PYTHON_PATH_HERE',
    scriptPath: './python',
    args: pythonArgs
  };

  PythonShell.run('get_user_projects.py', pythonOptions, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    results = results[0];
    console.log(results);
    res.send(results);
  });
};

router.use(getUserXnatSession);
router.use(getUserProjects);

module.exports = router;