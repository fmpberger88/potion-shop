const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });
const redisClient = require('../db/redisClient');

const cartRouter = express.Router();

// View Cart
cartRouter.get('/', ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart) {
            return res.render('cart', {
                title: 'Cart',
                cart: cart,
                csrfToken: req.csrfToken(),
            })
        }
        const totalCost = cart.items.reduce((total, item) => {
            return total + item.quantity * item.product.price;
        }, 0)
        res.render('cart', {
            title: 'cart',
            cart: cart,
            totalCost: totalCost.toFixed(2),
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        next(err);
    }
});

// Add to Cart
cartRouter.post('/add/:productId', ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.equals(product._id));
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += parseInt(req.body.quantity, 10);
        } else {
            cart.items.push({ product: product._id, quantity: parseInt(req.body.quantity, 10) });
        }

        await cart.save();

        // Update Redis cache
        const userId = req.user._id.toString();
        const cacheKey = `cartItemCount:${userId}`;
        await redisClient.set(cacheKey, cart.items.length, { EX: 3600 });

        res.redirect('/cart');
    } catch (err) {
        next(err);
    }
});

// Remove from Cart
cartRouter.post('/remove/:productId', ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).render('error', { message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => !item.product.equals(req.params.productId));
        await cart.save();

        // Update Redis cache
        const userId = req.user._id.toString();
        const cacheKey = `cartItemCount:${userId}`;
        await redisClient.set(cacheKey, cart.items.length, { EX: 3600 });

        res.redirect('/cart');
    } catch (err) {
        next(err);
    }
});

module.exports = cartRouter;
