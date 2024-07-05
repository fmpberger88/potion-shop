const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');
const crypto = require('crypto');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });

const passwordRouter = express.Router();

// GET password reset
passwordRouter.get('/forgot', csrfProtection, async (req, res) => {
    res.render('forgot-password', {
        csrfToken: req.csrfToken(),
    });
});

// POST password reset
passwordRouter.post('/forgot', csrfProtection, [
    body('email', 'Enter a valid email address')
        .isEmail()
        .normalizeEmail()
], async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('forgot-password', {
            csrfToken: req.csrfToken(),
            errors: errors.array()
        });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).render('forgot-password', {
                csrfToken: req.csrfToken(),
                errors: [{ msg: 'No account with that email address.' }],
            });
        }

        // Fill necessary User properties
        user.resetPasswordToken = crypto.randomBytes(16).toString('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1hour

        await user.save()

        // Send email
        const resetLink = `http://${req.headers.host}/reset/${user.resetPasswordToken}`;
        await sendEmail(user.email, 'Password Reset', `Please reset your password by clicking <a href="${resetLink}">here</a>.`);

        res.redirect('/auth/log-in');

    } catch (err) {
        next(err);
    }
});

// GET reset password form
passwordRouter.get('/reset/:token', csrfProtection, async (req, res, next) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).render('error', { message: 'Password reset token is invalid or has expired' });
        }

        res.render('reset-password', {
            csrfToken: req.csrfToken(),
            token: req.params.token
        });

    } catch (err) {
        next(err);
    }
});

// POST password reset
passwordRouter.post('/reset/:token', csrfProtection, [
    body('password', 'Password must be at least 8 characters long')
        .isLength({ min: 8 }),
    body('confirm_password', 'Password do not match')
        .custom((value, { req }) => value === req.body.password),
], async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('reset-password', {
            csrfToken: req.csrfToken(),
            token: req.params.token,
            errors: errors.array()
        });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('error', { message: 'Password reset token is invalid or has expired' });
        }

        // hash password
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined

        await user.save();
        res.redirect('/auth/log-in');
    } catch (err) {
        next(err);
    }
})

module.exports = passwordRouter;