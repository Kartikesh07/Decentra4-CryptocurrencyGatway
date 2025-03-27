const express = require('express');
const cors = require('./middleware/cors');
const fiat = require('./routes/fiat');
const liquidity = require('./routes/liquidity');

const app = express();

// Apply CORS middleware
app.use(cors);

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/fiat', fiat);
app.use('/api/liquidity', liquidity);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});