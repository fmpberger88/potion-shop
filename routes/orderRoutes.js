const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });

const orderRouter = express.Router();

// View Orders
orderRouter.get('/', ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product');
        res.render('orders', {
            orders: orders,
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        next(err);
    }
});

// Place Order
orderRouter.post('/place', ensureAuthenticated, csrfProtection, async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return res.status(404).render('error', { message: 'Cart not found' });
        }

        // Check stock and calculate total
        let total = 0;
        for (const item of cart.items) {
            if (item.quantity > item.product.stock) {
                return res.status(400).render('error', { message: `Insufficient stock for product ${item.product.name}` });
            }
            total += item.product.price * item.quantity;
        }

        // Create new order
        const newOrder = new Order({
            user: req.user._id,
            items: cart.items,
            total: total,
            status: 'Pending'
        });

        // Update stock
        for (const item of cart.items) {
            item.product.stock -= item.quantity;
            await item.product.save();
        }

        await newOrder.save();
        await Cart.deleteOne({ user: req.user._id });

        res.redirect('/orders');
    } catch (err) {
        next(err);
    }
});

module.exports = orderRouter;
