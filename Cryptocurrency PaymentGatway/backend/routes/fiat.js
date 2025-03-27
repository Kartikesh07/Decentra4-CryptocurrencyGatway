const express = require('express');
const router = express.Router();

// Store fiat transactions (in production, use a database)
let fiatTransactions = {};

// Deposit fiat
router.post('/deposit', async (req, res) => {
    try {
        const { address, currency, amount, transactionHash } = req.body;
        
        // Store the transaction
        const txKey = `${address}-${currency}-${transactionHash}`;
        fiatTransactions[txKey] = {
            address,
            currency,
            amount,
            transactionHash,
            timestamp: Date.now(),
            status: 'completed'
        };

        res.json({
            success: true,
            message: 'Fiat deposit successful',
            transaction: fiatTransactions[txKey]
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to process fiat deposit',
            message: error.message 
        });
    }
});

// Store fiat rates (in production, use a database)
let fiatRates = {
    USD: {
        rate: '180000000000',
        decimals: 8,
        isActive: true
    },
    EUR: {
        rate: '165000000000',
        decimals: 8,
        isActive: true
    },
    GBP: {
        rate: '142000000000',
        decimals: 8,
        isActive: true
    }
};

// Get rate for a specific currency
router.get('/rates/:currency', (req, res) => {
    try {
        const { currency } = req.params;
        const rateInfo = fiatRates[currency];
        
        if (!rateInfo) {
            return res.status(404).json({ error: 'Currency not found' });
        }
        
        res.json(rateInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rate' });
    }
});

module.exports = router;