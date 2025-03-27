const express = require('express');
const router = express.Router();

// Store fiat rates (in a real application, this would be in a database)
const fiatRates = {
    USD: { rate: 180000000000, decimals: 8, isActive: true },
    EUR: { rate: 165000000000, decimals: 8, isActive: true },
    GBP: { rate: 142000000000, decimals: 8, isActive: true }
};

// Get fiat rate for a specific currency
router.get('/rates/:currency', async (req, res) => {
    try {
        const { currency } = req.params;
        const rate = fiatRates[currency];
        
        if (!rate) {
            return res.status(404).json({ error: 'Currency not found' });
        }
        
        res.json(rate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch fiat rate' });
    }
});

// Verify fiat deposit transaction
router.post('/deposit/verify', async (req, res) => {
    try {
        const { transactionHash, currency, amount } = req.body;
        
        // Here you would typically verify the transaction on the blockchain
        // For now, we'll just return a success response
        res.json({
            verified: true,
            transaction: {
                hash: transactionHash,
                currency,
                amount,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify deposit' });
    }
});

// Verify fiat withdrawal transaction
router.post('/withdraw/verify', async (req, res) => {
    try {
        const { transactionHash, currency, amount } = req.body;
        
        // Here you would typically verify the transaction on the blockchain
        // For now, we'll just return a success response
        res.json({
            verified: true,
            transaction: {
                hash: transactionHash,
                currency,
                amount,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify withdrawal' });
    }
});

module.exports = router;