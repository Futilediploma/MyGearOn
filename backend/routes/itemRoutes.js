const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to fetch item media (icon) by itemId
router.get('/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const { region, namespace } = req.query;

    try {
        // Fetch item media from Blizzard API
        const response = await axios.get(
            `https://${region}.api.blizzard.com/data/wow/media/item/${itemId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BLIZZARD_ACCESS_TOKEN}`,
                },
                params: {
                    namespace: namespace,
                    locale: 'en_US',  // You can make this dynamic based on region or user preference
                },
            }
        );

        // Log the response for debugging (optional)
        console.log(`Item Media Response for itemId ${itemId}:`, response.data);

        // Send the media (icon) data back to the frontend
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching item media for itemId ${itemId}:`, error.message);
        res.status(500).json({ message: 'Failed to fetch item media' });
    }
});

module.exports = router;
