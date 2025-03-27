const express = require('express');
const router = express.Router();

// Store liquidity pool data (in production, use a database)
let poolData = {
    USD: {
        ethReserve: '1000000000000000000', // 1 ETH
        tokenReserve: '180000000000', // 1800 USD
        totalLiquidity: '1000000000000000000'
    },
    EUR: {
        ethReserve: '1000000000000000000',
        tokenReserve: '165000000000',
        totalLiquidity: '1000000000000000000'
    },
    GBP: {
        ethReserve: '1000000000000000000',
        tokenReserve: '142000000000',
        totalLiquidity: '1000000000000000000'
    }
};

// Store user liquidity data
let userLiquidity = {};

// Get pool information
router.get('/info/:currency', (req, res) => {
    try {
        const { currency } = req.params;
        const info = poolData[currency];
        
        if (!info) {
            return res.status(404).json({ error: 'Currency pool not found' });
        }
        
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pool information' });
    }
});

// Get user liquidity
router.get('/user-liquidity/:currency/:address', (req, res) => {
    try {
        const { currency, address } = req.params;
        const key = `${currency}-${address}`;
        
        // If no liquidity exists, return default values
        if (!userLiquidity[key]) {
            userLiquidity[key] = {
                ethShare: '0',
                tokenShare: '0',
                liquidityTokens: '0'
            };
        }
        
        res.json(userLiquidity[key]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user liquidity' });
    }
});

// Verify transaction
router.post('/verify/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { transactionHash, currency, ...data } = req.body;
        
        // In production, implement actual transaction verification
        res.json({ verified: true });
    } catch (error) {
        res.status(500).json({ error: 'Transaction verification failed' });
    }
});

module.exports = router;