const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell')

const checkPython = (req, res) => {

  // the pythonPath argument is where pipenv makes a virtual env
  const pythonOptions = {
    pythonPath: 'PYTHON_PATH_HERE',
    scriptPath: './python',
    args: ['bar']
  };

  PythonShell.run('check_python.py', pythonOptions, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
    res.send(results);
  });
};

router.use(checkPython);

module.exports = router;