const axios = require('axios');
require('dotenv').config();

exports.blizzardAuth = async () => {
    try {
        const authString = Buffer.from(
            `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`
        ).toString('base64');

        const response = await axios.post(
            `https://us.battle.net/oauth/token`,
            null,
            {
                headers: {
                    Authorization: `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    grant_type: 'client_credentials',
                    scope: 'wow.profile',  // Requesting the correct scope for character profiles
                },
            }
        );

        if (response.data && response.data.access_token) {
            process.env.BLIZZARD_ACCESS_TOKEN = response.data.access_token;
            console.log('Blizzard API authenticated successfully. Access token acquired.');
        } else {
            throw new Error('No access token received from Blizzard API.');
        }
    } catch (error) {
        if (error.response) {
            // Blizzard API returned an error
            console.error(
                `Failed to authenticate Blizzard API: ${error.response.status} ${error.response.statusText}`
            );
            console.error(error.response.data);
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received from Blizzard API:', error.request);
        } else {
            // Other errors
            console.error('Error during Blizzard API authentication:', error.message);
        }
    }
};
