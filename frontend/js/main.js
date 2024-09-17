document.addEventListener('DOMContentLoaded', () => {
    const gearList = document.getElementById('gear-list');
    const searchForm = document.getElementById('character-search-form');
    const errorMessage = document.getElementById('error-message');
    const itemLevelDisplay = document.getElementById('item-level-display');
    const characterPreview = document.getElementById('character-preview');  // Element for character preview

    const regions = [
        { region: 'us', namespace: 'profile-us' },
        { region: 'eu', namespace: 'profile-eu' },
        { region: 'kr', namespace: 'profile-kr' },
        { region: 'tw', namespace: 'profile-tw' }
    ];

    const fetchItemMedia = (itemId) => {
        return `https://img.wowthing.org/56/item/${itemId}.webp`;
    };

    // Fetch character media (avatar, in-game render) from Blizzard API
    const fetchCharacterMedia = async (characterName, realm, regionInfo) => {
        try {
            const response = await fetch(`/api/gear/media/${characterName}/${realm}?region=${regionInfo.region}&namespace=${regionInfo.namespace}`);
            if (response.ok) {
                const mediaData = await response.json();
                return mediaData;
            }
        } catch (error) {
            console.error(`Error fetching character media for ${characterName} from ${regionInfo.region}:`, error);
        }
        return null;
    };

    const fetchGearForRegion = async (characterName, realm, regionInfo) => {
        try {
            const response = await fetch(`/api/gear/${characterName}/${realm}?region=${regionInfo.region}&namespace=${regionInfo.namespace}`);
            if (response.ok) {
                const gearData = await response.json();
                return gearData;
            }
        } catch (error) {
            console.error(`Error fetching gear for ${characterName} from ${regionInfo.region}:`, error);
            throw new Error('Unable to fetch gear data due to server issues.');
        }
        return null;
    };

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Prevent form submission

        const characterName = document.getElementById('character-name').value.trim();
        const realm = document.getElementById('character-realm').value.trim();

        gearList.innerHTML = '';
        errorMessage.style.display = 'none';
        itemLevelDisplay.textContent = '';  // Clear the item level display
        characterPreview.innerHTML = '';  // Clear the character preview

        if (!characterName || !realm) {
            errorMessage.textContent = 'Both character name and realm are required!';
            errorMessage.style.display = 'block';
            return;
        }

        gearList.innerHTML = '<p>Loading gear...</p>';

        let gearData = null;
        let characterMedia = null;

        try {
            // Try to fetch character media (for preview)
            for (const regionInfo of regions) {
                characterMedia = await fetchCharacterMedia(characterName, realm, regionInfo);
                if (characterMedia) {
                    break;  // Stop searching if we find the media
                }
            }

            if (characterMedia && characterMedia.assets) {
                const avatarUrl = characterMedia.assets.find(asset => asset.key === 'avatar')?.value;  // Avatar URL
                const inGameRenderUrl = characterMedia.assets.find(asset => asset.key === 'main')?.value;  // In-game render URL
                
                // Display the character's preview (in-game render)
                if (inGameRenderUrl) {
                    characterPreview.innerHTML = `<img src="${inGameRenderUrl}" alt="Character Preview">`;
                } else if (avatarUrl) {
                    characterPreview.innerHTML = `<img src="${avatarUrl}" alt="Character Avatar">`;
                }
            }

            // Fetch the character's gear
            for (const regionInfo of regions) {
                gearData = await fetchGearForRegion(characterName, realm, regionInfo);
                if (gearData) {
                    break;  // Stop searching if we find the character
                }
            }

            gearList.innerHTML = '';  // Clear the loading message

            if (gearData && gearData.equipped_items && gearData.equipped_items.length > 0) {
                let totalItemLevel = 0;
                let itemCount = 0;

                for (const item of gearData.equipped_items) {
                    if (item.level && item.level.value) {
                        totalItemLevel += item.level.value;
                        itemCount++;
                    }
                }

                if (itemCount > 0) {
                    const averageItemLevel = (totalItemLevel / itemCount).toFixed(2);
                    itemLevelDisplay.textContent = `Average Item Level: ${averageItemLevel}`;
                } else {
                    itemLevelDisplay.textContent = 'Average Item Level: N/A';
                }

                // Loop through each equipped item and display it
                for (const item of gearData.equipped_items) {
                    const gearItem = document.createElement('div');
                    gearItem.classList.add('gear-item');

                    const slotName = item.inventory_type && item.inventory_type.name ? item.inventory_type.name : 'Unknown Slot';
                    const itemName = item.name || 'Unknown Item';
                    const itemLevel = item.level && item.level.display_string ? item.level.display_string : 'No Item Level';

                    const itemId = item.item.id;
                    const iconUrl = fetchItemMedia(itemId);

                    gearItem.innerHTML = `
                        <p><strong>${slotName}</strong></p>
                        <img src="${iconUrl}" alt="${itemName}">
                        <p>${itemName}</p>
                        <p>${itemLevel}</p>
                    `;

                    gearList.appendChild(gearItem);
                }
            } else {
                gearList.innerHTML = '<p>No gear found for this character across all regions.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            gearList.innerHTML = '';  // Clear the loading message
            errorMessage.textContent = 'Unable to display gear due to server issues. Please try again later.';
            errorMessage.style.display = 'block';
        }
    });
});
