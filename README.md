# 🧗 Boulder-Fans 🧗

A comprehensive application for bouldering enthusiasts built with Node.js, Express, MongoDB, and Handlebars.

## 🌟 Features

- 🛒 Users can browse and add bouldering gear to their cart.
- 👥 Admin users can add, edit, and delete products.
- 🗃️ Products are stored in a MongoDB database.
- ✅ Form validation and sanitization using `express-validator`.
- 🎨 Simple styling with CSS.
- 🔒 User authentication and authorization using `passport.js`.
- 📧 Email verification for new users.
- 🔄 Password reset functionality for users.
- 🛍️ Users can place orders for products in their cart.

## 🛠️ Getting Started

### Prerequisites

- 🟢 Node.js and npm installed.
- 🟠 MongoDB installed and running locally or use a MongoDB Atlas account.
- 🔵 Redis installed and running locally or use Redis on cloud.

### Installation

1. 📥 Clone the repository:
    ```bash
    git clone https://github.com/yourusername/boulder-fans.git
    cd boulder-fans
    ```

2. 📦 Install the dependencies:
    ```bash
    npm install
    ```

3. 🗝️ Create a `.env` file in the root directory and add your MongoDB, Redis, and email service credentials:
    ```env
    PORT=3000
    MONGODB_URI=YourMongoURL
    NODE_ENV=development
    SECRET_KEY=YourSecretKey
    REDIS_URL=YourRedisURL
    EMAIL_HOST=YourEmailHost
    EMAIL_PORT=YourEmailPort
    EMAIL_USER=YourEmailUser
    EMAIL_PASS=YourEmailPassword
    ```

4. 🚀 Start the application:
    ```bash
    node app.js
    ```

   Alternatively, use `nodemon` for development:
    ```bash
    npm install -g nodemon
    npm run dev
    ```

### Usage

1. 🌐 Open your browser and navigate to `http://localhost:3000`.
2. 👥 Sign up and log in to your account.
3. 🛒 Browse and add bouldering gear to your cart.
4. 🛍️ Place an order for the products in your cart.
5. 👤 Admin users can add, edit, and delete products.

## Dependencies

- [express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js.
- [mongoose](https://mongoosejs.com/) - Elegant MongoDB object modeling for Node.js.
- [connect-redis](https://www.npmjs.com/package/connect-redis) - Redis session storage for Express.
- [express-handlebars](https://github.com/ericf/express-handlebars) - A Handlebars view engine for Express.
- [express-validator](https://express-validator.github.io/docs/) - Express middleware for validation of incoming requests.
- [dotenv](https://github.com/motdotla/dotenv) - Loads environment variables from a `.env` file.
- [passport](http://www.passportjs.org/) - Simple, unobtrusive authentication for Node.js.
- [bcrypt](https://www.npmjs.com/package/bcrypt) - A library to help you hash passwords.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the passion for bouldering and the need for a comprehensive gear application.
- Thanks to all the open-source contributors whose libraries and tools made this project possible.
