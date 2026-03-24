let inventoryOpen = false;

function toggleInventory() {
    const invWindow = document.getElementById('inventory-window');
    if (!invWindow) return;

    inventoryOpen = !inventoryOpen;
    invWindow.style.display = inventoryOpen ? "block" : "none";
}

function showInventoryUI() {
    // This is handled by toggleInventory now, 
    // but you can add a "Pop" sound effect here later! 🌸
}

function hideInventoryUI() {
    inventoryOpen = false;
    document.getElementById('inventory-window').style.display = "none";
}

function equipItem(itemId) {
    const item = ITEM_DATABASE[itemId];
    if (!item) return;

    // Update the local player image objects
    // Assuming your core.js equipment object uses Image() objects
    player.equipment[item.layer].src = item.spritePath;

    // Save to Firebase
    db.collection("active_players").doc(player.id).update({
        ["equipment." + item.layer]: item.spritePath
    });
}