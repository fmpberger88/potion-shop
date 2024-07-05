const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('../middlewares/passport');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false })
const User = require('../models/User');

const authRoutes = express.Router();

// Register
authRoutes.get('/sign-up', csrfProtection, async (req, res) => {
    res.render('sign-up', {
        title: 'Sign Up',
        csrfToken: req.csrfToken(),
    });
})

authRoutes.post('/sign-up', csrfProtection, [
    body('email', 'Enter a valid email address')
        .isEmail()
        .normalizeEmail(),
    body('password', 'Password must be at least 8 characters long')
        .isLength({ min: 8 }),
    body('confirm_password', 'Passwords do not match')
        .custom((value, { req }) => value === req.body.password),
    body('first_name', 'First name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('last_name', 'Family name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('street', 'Street name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('zip_code', 'Zip Code is required')
        .trim()
        .isLength({ min: 4 })
        .escape(),
    body('city', 'City name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('country', 'Country name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg;
            return acc;
        }, {});

        // Render the form with error messages and input data
        return res.status(400).render('sign-up', {
            title: 'Sign Up',
            errors: formattedErrors,
            data: req.body, // Send back the input data so the user doesn't need to re-enter it
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).render('sign-up', {
                title: 'Sign Up',
                errors: { email: 'Email is already registered.' },
                data: req.body,
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            street: req.body.street,
            zip_code: req.body.zip_code,
            city: req.body.city,
            country: req.body.country,
        });
        await user.save();
        res.redirect('/auth/log-in');
    } catch (err) {
        return next(err);
    }
});

// Login Route
authRoutes.get('/log-in', (req, res) => {
    res.render('login', {
        title: 'Login'
    });
});

authRoutes.post('/log-in', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
}));

// Logout Route
authRoutes.get('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = authRoutes;
