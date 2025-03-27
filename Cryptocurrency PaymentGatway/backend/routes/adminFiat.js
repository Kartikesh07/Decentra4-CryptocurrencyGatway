const express = require('express');
const router = express.Router();

// Store admin and rate information (in production, use a database)
let adminData = {
    owner: '0xD9A6e4718919BCE695FC0Cd984b7f28B08d044D3', // Your admin address
    rates: {
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
    }
};

// Check ownership status
router.get('/check-owner/:address', (req, res) => {
    try {
        const { address } = req.params;
        res.json({
            isOwner: address.toLowerCase() === adminData.owner.toLowerCase()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check ownership' });
    }
});

// Get current rate for a currency
router.get('/rates/:currency', (req, res) => {
    try {
        const { currency } = req.params;
        const rateInfo = adminData.rates[currency];
        
        if (!rateInfo) {
            return res.status(404).json({ error: 'Currency not found' });
        }
        
        res.json(rateInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rate' });
    }
});

// Set new rate for a currency
router.post('/set-rate/:address', (req, res) => {
    try {
        const { address } = req.params;
        const { currency, rate, decimals } = req.body;
        
        if (address.toLowerCase() !== adminData.owner.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!adminData.rates[currency]) {
            return res.status(404).json({ error: 'Currency not found' });
        }

        adminData.rates[currency] = {
            ...adminData.rates[currency],
            rate,
            decimals: parseInt(decimals)
        };

        res.json({
            success: true,
            message: 'Rate updated successfully',
            data: adminData.rates[currency]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to set rate' });
    }
});

// Update currency status
router.post('/set-status/:address', (req, res) => {
    try {
        const { address } = req.params;
        const { currency, isActive } = req.body;
        
        if (address.toLowerCase() !== adminData.owner.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (!adminData.rates[currency]) {
            return res.status(404).json({ error: 'Currency not found' });
        }

        adminData.rates[currency].isActive = isActive;

        res.json({
            success: true,
            message: `Currency ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: adminData.rates[currency]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;