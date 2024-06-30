// errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Set a default status code if none is specified
    const statusCode = err.statusCode || 500;

    // Set the response status code
    res.status(statusCode);

    // Check if the environment is development or production
    if (req.app.get('env') === 'development') {
        console.error(err); // In development environment, log the error to the console

        // Render an error page with error details
        res.render('error', {
            title: 'Error',
            message: err.message,
            error: err // Pass the error object to the view in development mode
        });
    } else {
        // In production environment, do not expose stack traces to the client
        res.render('error', {
            title: 'Error',
            message: 'An error occurred', // Use a generic error message
            error: {} // Do not pass the error object in production
        });
    }
};

module.exports = errorHandler;
