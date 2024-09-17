const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to fetch character media (e.g., avatar, in-game renders)
router.get('/:characterName/:realm', async (req, res) => {
    const { characterName, realm } = req.params;
    const { region, namespace } = req.query;

    try {
        // Fetch character media from Blizzard API
        const response = await axios.get(
            `https://${region}.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${characterName.toLowerCase()}/character-media`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BLIZZARD_ACCESS_TOKEN}`,
                },
                params: {
                    namespace: namespace,
                    locale: 'en_US',  // Adjust based on region or language
                },
            }
        );

        // Log and return the media data
        console.log(`Character Media for ${characterName} from ${realm}:`, response.data);
        res.json(response.data);
    } catch (error) {
        console.error(`Error fetching character media for ${characterName} from ${realm}:`, error.message);
        res.status(500).json({ message: 'Failed to fetch character media.' });
    }
});

module.exports = router;
