document.addEventListener('DOMContentLoaded', () => {
    const gearList = document.getElementById('gear-list');
    const searchForm = document.getElementById('character-search-form');
    const errorMessage = document.getElementById('error-message');

    const regions = [
        { region: 'us', namespace: 'profile-us' },
        { region: 'eu', namespace: 'profile-eu' },
        { region: 'kr', namespace: 'profile-kr' },
        { region: 'tw', namespace: 'profile-tw' }
    ];

    // Fetch the item media (icon) using WowThing CDN
    const fetchItemMedia = (itemId) => {
        return `https://img.wowthing.org/56/item/${itemId}.webp`;
    };

    const fetchGearForRegion = async (characterName, realm, regionInfo) => {
        try {
            const response = await fetch(`/api/gear/${characterName}/${realm}?region=${regionInfo.region}&namespace=${regionInfo.namespace}`);
            if (response.ok) {
                const gearData = await response.json();
                console.log(`Gear Data for ${characterName} from ${regionInfo.region}:`, gearData); // Log gear data
                return gearData;
            }
        } catch (error) {
            console.error(`Error fetching gear for region ${regionInfo.region}:`, error);
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

        if (!characterName || !realm) {
            errorMessage.textContent = 'Both character name and realm are required!';
            errorMessage.style.display = 'block';
            return;
        }

        gearList.innerHTML = '<p>Loading gear...</p>';

        let gearData = null;
        try {
            // Try to fetch the gear from all regions
            for (const regionInfo of regions) {
                gearData = await fetchGearForRegion(characterName, realm, regionInfo);
                if (gearData) {
                    break;  // Stop searching if we find the character
                }
            }

            gearList.innerHTML = '';  // Clear the loading message

            if (gearData && gearData.equipped_items && gearData.equipped_items.length > 0) {
                // Loop through each equipped item and display it
                for (const item of gearData.equipped_items) {
                    const gearItem = document.createElement('div');
                    gearItem.classList.add('gear-item');

                    const slotName = item.inventory_type && item.inventory_type.name ? item.inventory_type.name : 'Unknown Slot';
                    const itemName = item.name || 'Unknown Item';
                    const itemLevel = item.level && item.level.display_string ? item.level.display_string : 'No Item Level';

                    // Fetch the item media (icon) for each item
                    const itemId = item.item.id;
                    const iconUrl = fetchItemMedia(itemId);  // Use WowThing icon URL

                    gearItem.innerHTML = `
                        <p><strong>${slotName}</strong></p>
                        <img src="${iconUrl}" alt="${itemName}">
                        <p>${itemName}</p>
                        <p>${itemLevel}</p>
                    `;

                    gearList.appendChild(gearItem);
                }
            } else {
                // Log the gearData in case it's empty
                console.log(`No equipped items found for character:`, gearData);
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
