const { engine } = require('express-handlebars');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const logger = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const session = require('express-session');
const passport = require('./middlewares/passport');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default
require('dotenv').config();

const indexRouter = require('./routes/index');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const usersRouter = require('./routes/users');

// ________________ Database ________________
require('./db/mongoDB');

// ________________ Environment Variables ________________
const PORT = process.env.PORT || 5000;

// ________________ Express App ________________
const app = express();

// ________________ View Engine ________________
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    formatDate: function (date, format) {
      const dateFormat = {
        'fullDate': { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
        'shortDate': { year: 'numeric', month: 'short', day: 'numeric' }
      };
      return new Intl.DateTimeFormat('en-US', dateFormat[format] || dateFormat['shortDate']).format(date);
    },
    ifEquals: function(arg1, arg2, options) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));



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

// ________________ Routes ________________

app.use('/', indexRouter);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/user', usersRouter);
app.use('/products', productRoutes);

// ________________ ErrorHandler ________________
// CSRF ErrorHandler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  // handle CSRF token errors here
  res.status(403);
  res.send('form tampered with');
});


// Custom 404 Middleware
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// General Error Handling Middleware
app.use(errorHandler);

module.exports = app;
