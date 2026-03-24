let inventoryOpen = false;

function toggleInventory() {
    inventoryOpen = !inventoryOpen;
    console.log("Inventory is now: " + (inventoryOpen ? "Open" : "Closed"));
    
    // For now, let's just alert, but eventually this will pop up a UI
    if (inventoryOpen) {
        showInventoryUI();
    } else {
        hideInventoryUI();
    }
}

function showInventoryUI() {
    // You can create a div overlay here later 🌸
    alert("Opening your Dynamic Prism closet...");
}

function hideInventoryUI() {
    // Logic to close the closet
}

// Function to "Equip" an item
function equipItem(itemId) {
    const item = ITEM_DATABASE[itemId];
    if (!item) return;

    player.currentOutfit[item.layer] = itemId;
    
    // Save to Firebase so other players see your new look
    db.collection("users").doc(auth.currentUser.uid).update({
        ["currentOutfit." + item.layer]: itemId
    });
}