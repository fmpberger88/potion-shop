const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const isAdmin = require('../middlewares/isAdmin');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false })

const productRouter = express.Router();
// Allowed Categories
const allowedCategories = ['Bouldering', 'Sport Climbing', 'Trad Climbing', 'Mountaineering', 'Accessories'];

// Read all products
productRouter.get('/', csrfProtection, async (req, res, next) => {
    try {
        let query = {};

        if (req.query.category && allowedCategories.includes(req.query.category)) {
            query.category = req.query.category;
        }
        if (req.query.minPrice) {
            query.price = { ...query.price, $gte: parseFloat(req.query.minPrice) };
        }
        if (req.query.maxPrice) {
            query.price = { ...query.price, $lte: parseFloat(req.query.maxPrice) };
        }
        if (req.query.availability) {
            if (req.query.availability === 'inStock') {
                query.stock = { $gt: 0 };
            } else if (req.query.availability === 'outOfStock') {
                query.stock = { $lte: 0 };
            }
        }
        console.log(query)
        console.log(req.query);

        const products = await Product.find(query);
        res.render('products', {
            title: 'Products',
            products: products,
            csrfToken: req.csrfToken(),
            allowedCategories: allowedCategories,
            filters: req.query
        });
    } catch (err) {
        next(err);
    }
});



// Create a new product (Form)
productRouter.get('/create', isAdmin, csrfProtection, async (req, res, next) => {
    res.render('create-product', { title: 'Create Product', csrfToken: req.csrfToken(), allowedCategories: allowedCategories });
});

// Create a new product (Submission)
productRouter.post('/create', isAdmin, csrfProtection, [
    body('name', 'Product name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category', 'Category is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('description', 'Description is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('price', 'Price is required')
        .isFloat({ min: 0 }),
    body('stock', 'Stock is required')
        .isFloat({ min: 0 }),
    body('imageUrl')
        .optional()
],async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg;
            return acc;
        }, {});

        // Render the form with error messages and input data
        return res.status(400).render('create-product', {
            title: 'Create Product',
            errors: formattedErrors,
            data: req.body, // Send back the input data so the user doesn't need to re-enter it
            csrfToken: req.csrfToken(),
            allowedCategories: allowedCategories
        });
    }

    const { name, category, description, price, stock, imageUrl } = req.body;
    try {
        const newProduct = new Product({
            name,
            category,
            description,
            price,
            stock,
            imageUrl
        });

        await newProduct.save();
        res.redirect('/products');
    } catch (err) {
        next(err);
    }
})



// Update a product by ID (Form)
productRouter.get('/:id/edit', isAdmin, csrfProtection, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }
        res.render('edit-product', {
            title: 'Edit Product',
            product: product,
            csrfToken: req.csrfToken(),
            allowedCategories: allowedCategories
        });
    } catch (err) {
        next(err);
    }
})

// Update a product by ID (Submission)
productRouter.post('/:id/edit', [
    body('name', 'Product name is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('category', 'Category is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('description', 'Description is required')
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('price', 'Price is required')
        .isFloat({ min: 0 }),
    body('stock', 'Stock is required')
        .isFloat({ min: 0 }),
    body('imageUrl')
        .optional()
],async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg;
            return acc;
        }, {});

        // Render the form with error messages and input data
        return res.status(400).render('edit-product', {
            title: 'Edit Product',
            errors: formattedErrors,
            data: req.body, // Send back the input data so the user doesn't need to re-enter it
            csrfToken: req.csrfToken(),
            allowedCategories: allowedCategories
        });
    }

    const { name, category, description, price, stock, imageUrl } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { message: "Product not found"})
        }

        product.name = name;
        product.category = category;
        product.description = description;
        product.price = price;
        product.stock = stock;
        product.imageUrl = imageUrl;

        await product.save();
        res.redirect(`/products/${product.id}`)
    } catch (err) {
        next(err);
    }
})

// Delete a product by ID (Form)
productRouter.get('/:id/delete', isAdmin, csrfProtection, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found'});
        }
        res.render('delete-product', {
            title: 'Delete Product',
            product: product,
            csrfToken: req.csrfToken()
        })
    } catch (err) {
        next(err);
    }
});

// Delete a product by ID (Submission)
productRouter.post('/:id/delete', isAdmin, csrfProtection, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found' });
        }
        await Product.findByIdAndDelete(req.params.id)
        res.redirect('/products')
    } catch (err) {
        next(err);
    }
});

// Read a single product by ID
productRouter.get('/:id', csrfProtection, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).render('error', { message: 'Product not found'});
        }
        res.render('product-detail', {
            title: 'Product Details',
            product: product,
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        next(err);
    }
});

module.exports = productRouter;