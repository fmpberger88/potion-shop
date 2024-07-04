const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    zip_code: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }],
}, {
    timestamps: true // Automatically creates createdAt and updatedAt fields
})

// Virtual for user's fullname
userSchema.virtual('name').get(function() {
    let fullname = '';
    if (this.first_name && this.last_name) {
        fullname = `${this.last_name}, ${this.first_name}`;
    }
    return fullname;
})

module.exports = mongoose.model('User', userSchema);