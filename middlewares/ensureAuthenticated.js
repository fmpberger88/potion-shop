// ensureAuthenticated.js

function ensureAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        // User is not authenticated
        res.status(401).render('401', { title: '401 - Unauthorized' });
    } else {
        // User is authenticated, proceed to the next middleware
        next();
    }
}

module.exports = ensureAuthenticated;
