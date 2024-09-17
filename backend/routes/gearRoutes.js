const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to get character gear from Blizzard API based on region and namespace
router.get('/:characterName/:realm', async (req, res) => {
    const { characterName, realm } = req.params;
    const { region, namespace } = req.query;

    try {
        // Make the request to Blizzard API for the correct region and namespace
        const response = await axios.get(
            `https://${region}.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${characterName.toLowerCase()}/equipment`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BLIZZARD_ACCESS_TOKEN}`,
                },
                params: {
                    namespace: namespace,  // Dynamic namespace for the correct region
                    locale: 'en_US',  // Adjust this if necessary
                },
            }
        );

        // Log the full response to see if Blizzard is returning any errors or data
        console.log(`Blizzard API response for character ${characterName}:`, response.data);

        // Send the gear data back to the frontend
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching gear from Blizzard API for ${characterName} in ${region}:`, error.message);
        if (error.response && error.response.data) {
            console.error('Blizzard API Error Response:', error.response.data);  // Log any detailed error response
        }
        res.status(500).json({ message: 'Failed to fetch gear data from Blizzard API.' });
    }
});

module.exports = router;
