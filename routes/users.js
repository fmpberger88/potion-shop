const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const userRouter = express.Router();
const User = require('../models/User');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const csrf = require('csurf');
const req = require("express/lib/request");
const user = require("debug");
const res = require("express/lib/response");
const csrfProtection = csrf({ cookie: false });

// GET user account
userRouter.get('/', ensureAuthenticated, csrfProtection, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.render('error', { message: 'User does not exist' });
    }
    res.render('account', {
      user: user,
      csrfToken: req.csrfToken()
    })
  } catch (err) {
    next(err);
  }
});

// GET update user account
userRouter.get('/edit', ensureAuthenticated, csrfProtection, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.render('error', { message: 'User does not exist' });
    }
    res.render('edit-account', {
      user: user,
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    next(err);
  }
});

// POST update user account
userRouter.post('/edit', ensureAuthenticated, csrfProtection, [
  body('first_name').notEmpty().withMessage('First Name is required'),
  body('last_name').notEmpty().withMessage('Last Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('street').notEmpty().withMessage('Street is required'),
  body('zip_code').notEmpty().withMessage('Zip Code is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('country').notEmpty().withMessage('Country is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('edit-account', {
      user: req.user,
      csrfToken: req.csrfToken(),
      errors: errors.array()
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.render('error', { message: 'User does not exist' });
    }

    const { first_name, last_name, email, street, zip_code, city, country } = req.body;
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.street = street;
    user.zip_code = zip_code;
    user.city = city;
    user.country = country;

    await user.save();
    res.redirect('/user');

  } catch (err) {
    next(err);
  }
});

// GET update password
userRouter.get('/edit-password', ensureAuthenticated, csrfProtection, async (req, res, next) => {
  res.render('edit-password', {
    csrfToken: req.csrfToken(),
  })
});

// POST update password
userRouter.post('/edit-password', ensureAuthenticated, csrfProtection, [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password do not match')
      }
      return true;
    })
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('edit-password', {
      csrfToken: req.csrfToken(),
      errors: errors.array()
    });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.render('error', { message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(req.body.current_password, user.password);
    if (!isMatch) {
      return res.render('edit-password', {
        csrfToken: req.csrfToken(),
        errors: [{ msg: 'Current password is incorrect'}]
      });
    }

    user.password = await bcrypt.hash(req.body.new_password, 10);
    await user.save()
    res.redirect('/user');

  } catch(err) {
    next(err)
  }
})

module.exports = userRouter;
