const express = require('express');
const dotEnv = require('dotenv');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const { v4: uuid } = require('uuid');
const cors = require('cors');

// routes
const login = require('./routes/login');
const authCallback = require('./routes/auth-callback');
const user = require('./routes/user');
const checkPython = require('./routes/check-python.js');
const getUserProjects = require('./routes/get-user-projects');

// load .env file if not in production
if (process.env.NODE_ENV !== 'production') {
  dotEnv.config();
}

// instance of express
const app = express();

// TODO: check options here
app.use(express.urlencoded({ extended: true }));

// cors configuration
const corsOptions = {
  origin: 'FRONTEND_HERE',
  credentials: true
};


// session, with unique id generation
app.use(session({
  genid: (req) => {
    return uuid() // session IDs
  },
  // change store and secret in prod.
  store: new FileStore(),
  secret: 'SECRET_HERE',
  resave: true,
  saveUninitialized: false
}));

// route set up 
app.use('/login', login); // login page
app.use('/auth-callback', authCallback); // authentication callback
app.use('/user', cors(corsOptions), user); // user information
app.use('/check-python', checkPython); // check python
app.use('/user-projects', cors(corsOptions), getUserProjects); // get user's XNAT projects 

// listen on PORT
app.listen(process.env.PORT, () => {
  console.log(`Backend-for-frontend listening at localhost:${process.env.PORT}`);
})
