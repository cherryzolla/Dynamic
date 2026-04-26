// idfone.js
async function openIdFone(player) {
    const overlay = document.getElementById('idfone-overlay');
    if (!overlay) {
        console.error("ID Fone Overlay not found in HTML!");
        return;
    }

    // 1. Show the phone as a flex container to align columns
    overlay.style.display = 'flex';

    let data = player; // Default to local player data

    // 2. Try to get fresh data from Firebase
    try {
        const userRef = window.db.collection("users").doc(player.id);
        const snap = await userRef.get();
        if (snap.exists) {
            data = snap.data();
        }
    } catch (error) {
        console.warn("Firebase Quota hit or error - using local data.");
    }
    // Inside openIdFone(player)
    // Inside openIdFone
        const renderBox = document.getElementById('idfone-avatar-render');
        if (renderBox && player.equipment) {
    renderBox.innerHTML = ''; // Clear old preview

    const layers = ['board', 'body', 'face'];
    layers.forEach((layer, index) => {
        if (player.equipment[layer]) {
            const img = document.createElement('img');
            img.src = player.equipment[layer].src;
            img.style.zIndex = index + 1;
            renderBox.appendChild(img);
        }
    });
    }
    // Inside your openIdFone(player) function
    const avatarBox = document.querySelector('.idfone-avatar-preview');

    if (avatarBox) {
    // 1. Clear the "P" or old character
    avatarBox.innerHTML = ''; 

    // 2. Add Board (if exists) - Boards usually go behind the player
    if (player.equipment.board) {
        const boardImg = document.createElement('img');
        boardImg.src = player.equipment.board.src;
        boardImg.style.zIndex = "1";
        avatarBox.appendChild(boardImg);
    }

    // 3. Add Body
    if (player.equipment.body) {
        const bodyImg = document.createElement('img');
        bodyImg.src = player.equipment.body.src;
        bodyImg.style.zIndex = "2";
        avatarBox.appendChild(bodyImg);
    }

    // 4. Add Face
    if (player.equipment.face) {
        const faceImg = document.createElement('img');
        faceImg.src = player.equipment.face.src;
        faceImg.style.zIndex = "3";
        avatarBox.appendChild(faceImg);
    }

    // Add them to the box
    avatarBox.appendChild(bodyImg);
    avatarBox.appendChild(faceImg);
    }

    // 3. Update the UI
    const nameEl = document.getElementById('idfone-username');
    const starEl = document.getElementById('idfone-stars');
    const ecoinEl = document.getElementById('idfone-ecoins');
    const goldEl = document.getElementById('idfone-gold');
    const lvlEl = document.getElementById('idfone-level');

    if (nameEl) nameEl.innerText = data.username || data.name || "Unknown";
    if (starEl) starEl.innerText = data.stars || 0;
    if (ecoinEl) ecoinEl.innerText = data.ecoins || 0;
    if (goldEl) goldEl.innerText = data.gold || 0;
    if (lvlEl) lvlEl.innerText = data.level || 1;

    console.log("IDFone is now open!");
}
    function findItem(itemId) {
    // 1. Check a local cache or the global ALL_ITEMS first
    for (const category in ALL_ITEMS) {
        const item = ALL_ITEMS[category].find(i => i.id === itemId);
        if (item) return item;
    }
    console.error("Item not found in backup JSON:", itemId);
    return null;
}
    async function getItemData(itemId) {
    try {
        // 1. Try Firebase First
        const snap = await db.collection("items").doc(itemId).get();
        if (snap.exists) return snap.data();
    } catch (error) {
        console.warn("Firebase offline/limit hit. Switching to all_items.json backup.");
        
        // 2. Backup: Fetch local JSON
        const response = await fetch('all_items.json');
        const backupData = await response.json();
        
        // Look through all categories (tops, hair, etc) to find the item
        for (const category in backupData) {
            const item = backupData[category].find(i => i.id === itemId);
            if (item) return item;
        }
    }
    return null;
    }
function closeIdFone() {
    document.getElementById('idfone-overlay').style.display = 'none';
}