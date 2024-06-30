const createError = require('http-errors');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const logger = require('morgan');
const bcrypt = require('bcrypt')
const session = require('express-session');
const passport = require('./middlewares/passport');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// ________________ Database ________________
require('./db/mongoDB');

// ________________ Environment Variables ________________
const PORT = process.env.PORT || 5000;

// ________________ Express App ________________
const app = express();

// ________________ View Engine ________________
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// ________________ Static Files ________________
app.use(express.static(path.join(__dirname, 'public')));

// ________________ Middlewares ________________
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// ________________ Redis Store ________________
// Initialize client.
let redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.connect().catch(console.error)

// ________________ Express Session ________________
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 30 * 60 * 60 * 1000,
    sameSite: 'Strict'
  }
}));

// ________________ Passport Configuration ________________
app.use(passport.session());

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user; // Make user object available in all views
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// ________________ ErrorHandler ________________
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
