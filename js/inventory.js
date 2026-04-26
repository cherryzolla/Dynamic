let inventoryOpen = false;
let currentMainCat = 'hair';
let currentSubCat = null;

// Map your main tabs to their sub-categories based on your screenshots
const subCategories = {
    "hair": [],
    "tops": ["top", "bottom", "outfits", "costumes", "shoes"],
    "faceAcc": ["body", "face", "hair", "moodies", "face painting", "makeup", "earrings"],
    "board": [],
    "creature": []
};

function toggleInventory() {
    const invWindow = document.getElementById('inventory-window');
    if (!invWindow) return;

    inventoryOpen = !inventoryOpen;
    invWindow.style.display = inventoryOpen ? "block" : "none";

    if (inventoryOpen) {
        // Default to Hair tab when opening
        filterInv('hair');
        updatePreview(); 
    }
}

// This handles clicking the Main Tabs (Hair, Clothes, etc.)
async function filterInv(mainCat) {
    currentMainCat = mainCat;
    const subNav = document.getElementById('sub-nav-bar');
    if (!subNav) return;

    subNav.innerHTML = ""; // Clear existing sub-titles

    // If this category has sub-titles (like Clothes or Accessory)
    if (subCategories[mainCat] && subCategories[mainCat].length > 0) {
        subCategories[mainCat].forEach(sub => {
            const btn = document.createElement('span');
            btn.innerText = sub.toUpperCase();
            btn.style.cursor = "pointer";
            btn.style.padding = "0 10px";
            btn.onclick = () => {
                currentSubCat = sub;
                loadFilteredItems();
            };
            subNav.appendChild(btn);
        });
        currentSubCat = subCategories[mainCat][0]; // Default to first sub-tab
    } else {
        currentSubCat = null;
    }

    loadFilteredItems();
}

// This fetches the actual items from your Firebase "inventory" sub-collection
async function loadFilteredItems() {
    const itemGrid = document.getElementById('item-grid');
    if (!itemGrid) return;

    itemGrid.innerHTML = "Loading...";

    try {
        let query = db.collection("users").doc(player.id).collection("inventory")
                      .where("type", "==", currentMainCat);
        
        if (currentSubCat) {
            query = query.where("subType", "==", currentSubCat);
        }

        const snapshot = await query.get();
        itemGrid.innerHTML = "";

        if (snapshot.empty) {
            itemGrid.innerHTML = `<p style="color:gray; padding:10px;">No items found.</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const item = doc.data();
            const slot = document.createElement('div');
            slot.style = "background:white; border:2px solid #79B8E0; border-radius:10px; height:80px; width:80px; display:flex; align-items:center; justify-content:center; cursor:pointer;";
            
            // Inside loadFilteredItems()
            slot.innerHTML = `<img src="${item.icon}" style="width: 150%; height: 150%; object-fit: cover; object-position: center top; margin-top: 10px;">`;

            // Your equip function
            slot.onclick = () => equipItem(item);
            
            itemGrid.appendChild(slot);
        });
    } catch (err) {
        console.error("Inventory Load Error:", err);
    }
}
function equipItem(item) {
    console.log("Equipping:", item.name, "Type:", item.type);

    // 1. TOPS (Shirts/Outfits)
    if (item.type === 'tops') {
        player.equipment.body.src = item.src; 
        player.equipment.body.onload = () => updatePreview();
    } 
    
    // 2. HAIR (Usually in the 'hair' tab)
    else if (item.type === 'hair') {
        player.equipment.face.src = item.src;
        player.equipment.face.onload = () => updatePreview();
    } 

    // 3. BOARDS (Under the feet)
    else if (item.type === 'board') {
        if (!player.equipment.board) player.equipment.board = new Image();
        player.equipment.board.src = item.src;
        player.equipment.board.onload = () => {
            player.equipment.board.complete = true;
        };
    }

    // 4. FACE ACCESSORIES (Makeup, Moodies, Earrings, Face Paint)
    // Using your 'faceAcc' main category
    else if (item.type === 'faceAcc') {
        // We can create a specific layer for face accessories if needed
        if (!player.equipment.extra) player.equipment.extra = new Image();
        player.equipment.extra.src = item.src;
        player.equipment.extra.onload = () => {
            player.equipment.extra.complete = true;
            updatePreview();
        };
    }

    // 5. CREATURES (Pets/Followers)
    else if (item.type === 'creature') {
        if (!player.equipment.pet) player.equipment.pet = new Image();
        player.equipment.pet.src = item.src;
        player.equipment.pet.onload = () => {
            player.equipment.pet.complete = true;
        };
    }

    // Sync to Firebase
    db.collection("active_players").doc(player.id).update({
        bodySrc: player.equipment.body.src || "",
        faceSrc: player.equipment.face.src || "",
        boardSrc: player.equipment.board ? player.equipment.board.src : "",
        hairSrc : player.equipment.hair ? player.equipment.hair.src : "",
        extraSrc: player.equipment.extra ? player.equipment.extra.src : "",
        petSrc: player.equipment.pet ? player.equipment.pet.src : ""
    }).then(() => {
        console.log("Full outfit synced!");
    });

    updatePreview(); 
}

// Draws your character in that right-side preview box
function updatePreview() {
    const pCanvas = document.getElementById('previewCanvas');
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    
    // Clear the box
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

    // Center the character
    const centerX = pCanvas.width / 2;
    const drawY = 40;

    // 1. Draw Body (This is the skin/shirt combined in your case)
    if (player.equipment.body && player.equipment.body.complete) {
        // Use the same 55x95 dimensions you used in drawPlayer
        pCtx.drawImage(player.equipment.body, 0, 0, 55, 95, centerX - 45, drawY, 90, 160);
    }

    // 2. Draw Face/Hair
    if (player.equipment.face && player.equipment.face.complete) {
        // We use the same offset math from your drawPlayer function
        pCtx.drawImage(player.equipment.face, 0, 0, 100, 85, (centerX - 45) + 21, drawY - 15, 95, 85);
    }
}
db.collection("items").onSnapshot((snapshot) => { 
    itemGrid.innerHTML = "";

    snapshot.forEach(doc => {
    const item = doc.data();
    const slot = document.createElement('div');
    
    // Style the slot
    slot.style.width = "85px";
    slot.style.height = "85px";
    slot.style.backgroundColor = "white";
    slot.style.border = "2px solid #79B8E0";
    slot.style.borderRadius = "10px";
    slot.style.overflow = "hidden";
    slot.style.position = "relative";
    slot.style.display = "flex";
    slot.style.justifyContent = "center";
    slot.style.cursor = "pointer";

    // Set the Icon (Clipped to first frame)
    slot.innerHTML = `
        <img src="${item.icon}" style="
            height: 120%; 
            width: auto; 
            position: absolute;
            top: -5px;
            left: 5px;
        ">`;

    // THE IMPORTANT PART: Clicking equips the item
    slot.onclick = () => {
        equipItem(item);
    };
    itemGrid.appendChild(slot);
    });
});