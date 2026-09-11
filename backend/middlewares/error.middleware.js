// middlewares/error.middleware.js

const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.message);

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            message: "Duplicate field value entered"
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            message: messages
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;