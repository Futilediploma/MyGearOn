const axios = require('axios');

exports.getGear = async (req, res) => {
    const { characterName, realm } = req.params;

    try {
        console.log(`Fetching gear for ${characterName} from ${realm}`);

        const response = await axios.get(
            `https://us.api.blizzard.com/profile/wow/character/${realm.toLowerCase()}/${characterName.toLowerCase()}/equipment`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.BLIZZARD_ACCESS_TOKEN}`,
                },
                params: {
                    namespace: 'profile-us', // Ensure this is correct for the character's region
                    locale: 'en_US',
                },
            }
        );

        // Handle success case
        return res.json(response.data);
        
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                // Character not found
                console.error('Character not found:', error.response.data);
                return res.status(404).json({ message: 'Character not found', detail: error.response.data });
            }
            // Handle other error responses (e.g., 500, 403)
            console.error(`Error ${error.response.status}:`, error.response.data);
            return res.status(error.response.status).json({
                message: `Blizzard API error: ${error.response.statusText}`,
                detail: error.response.data,
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received from Blizzard API:', error.request);
            return res.status(500).json({ message: 'No response from Blizzard API', detail: error.request });
        } else {
            // Other unexpected errors
            console.error('Error:', error.message);
            return res.status(500).json({ message: 'An unexpected error occurred', detail: error.message });
        }
    }
};
