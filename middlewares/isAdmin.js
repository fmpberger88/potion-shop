function isAdmin(req, res, next) {
    // First, check if the user is authenticated.
    if (!req.isAuthenticated()) {
        // If not authenticated, render the 401 Unauthorized page.
        return res.status(401).render('401', { title: '401 - Unauthorized' });
    }

    // Next, check if the authenticated user is an admin.
    if (!req.user.isAdmin) {
        // If the user is not an admin, render the 403 Forbidden page.
        return res.status(403).render('403', { title: '403 - Forbidden', message: 'Access is restricted to administrators only.' });
    }

    // If the user is authenticated and an admin, proceed to the next middleware.
    next();
}

module.exports = isAdmin;
