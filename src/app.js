const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const userRoutes = require('./modules/user/user.routes');
const authRoutes = require('./modules/auth/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Modular CRUD API!' });
});

// Use authentication routes
app.use('/api/auth', authRoutes);

// Use user routes under /api/users prefix
app.use('/api/users', userRoutes);

// Global Error Handler Middleware
// Must be registered at the very end after all routes
app.use(errorMiddleware);

module.exports = app;
