const express = require('express');
const router = express.Router();

const getUser = (req, res) => {
  //const user = req.session.user;
  if (req.session.user) {
    res.send({ user: req.session.user });
  } else {
    res.send({ user: '' });
  }
}

router.use(getUser);

// export
module.exports = router;