const express = require('express');
const router = express.Router();
const qs = require('qs');
const { PythonShell } = require('python-shell');
const getUserXnatSession = require('../utilities/get-user-xnat-session');

const getProjectSessions = (req, res) => {

  const qryStr = new URL(`FRONTEND_HERE${req.url}`).searchParams;
  const project = qryStr.get('project');
  
  const userXnatUrls = req.session.userXnatUrls;
  const userSessionIds = req.session.xnatSessions;
  const pythonArgs = userXnatUrls.concat(userSessionIds);
  console.log(pythonArgs);

  // in python options,
  // python path is the pipenv virtual env path
  // and args should be [url_1, url_2, url_n, sessionId_1, sessionId_2, sessionId_n]
  const pythonOptions = {
    pythonOptions: ['-u'],
    pythonPath: 'PYTHON_PATH_HERE',
    scriptPath: './python',
    args: pythonArgs
  };

  PythonShell.run('get_user_projects.py', pythonOptions, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
    res.send({ projects: results});
  });
};

router.use(getUserXnatSession);
router.use(getProjectSessions);

module.exports = router;