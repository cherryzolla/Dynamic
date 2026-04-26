const firebaseConfig = {
    apiKey: "AIzaSyAXvloQVCgdaqHJSUMW9EjoMR6loLsDKpQ",
    authDomain: "dynamic-40949.firebaseapp.com",
    projectId: "dynamic-40949",
    storageBucket: "dynamic-40949.firebasestorage.app",
    messagingSenderId: "377647789786",
    appId: "1:377647789786:web:0c9b5fbdd0880f36b297e3"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// Attach it to the window so idfone.js can "see" it
window.db = db;
// --- 1. CANVAS SETUP ---
const mainCanvas = document.getElementById('prismCanvas');
const ctx = mainCanvas.getContext('2d'); 
const canvas = mainCanvas;

// Inventory Preview Canvas
const previewCanvas = document.getElementById('previewCanvas');
const pCtx = previewCanvas ? previewCanvas.getContext('2d') : null;

let game = { active: false, cameraX: 0, bg: new Image(), frameCount: 0 };
game.bg.src = "assets/rooms/Fantage_Downtown_BareBones.png";

let player = {
    id: null, x: 400, y: 380, targetX: 400, targetY: 380,
    width: 60, height: 95, name: "User", gender: "F",
    // These are the "Skin" layers that stay under the clothes
    baseBody: new Image(),
    baseHead: new Image(),
    // These are the "Clothes" layers
    equipment: { body: new Image(), face: new Image() }
};

let otherPlayers = {}; 

// --- 2. AUTH & DATA LOAD ---
auth.onAuthStateChanged(user => {
    if (user) {
        player.id = user.uid;
        db.collection("users").doc(user.uid).get().then(doc => {
            const data = doc.data() || {};
            player.name = data.username || "Traveler";
            
            let g = data.gender ? data.gender.toUpperCase() : "F";
            player.gender = (g === "M" || g === "BOY") ? "M" : "F";

            if (player.gender === "M") {
            player.baseBody.src = `assets/items/boy/body/orig-body-1-1_orig.png`; 
            player.baseHead.src = `assets/items/boy/body/orig-face-1-1_orig.png`;
            } else {
            player.baseBody.src = `assets/items/girl/body/orig-body-1_orig.png`;
            player.baseHead.src = `assets/items/girl/body/orig-face-1_orig.png`;
            }

            startMultiplayer();
            startGame();
        });
    } else {
        window.location.href = "index.html";
    }
});

function startMultiplayer() {
    db.collection("active_players")
      .where(firebase.firestore.FieldPath.documentId(), "!=", player.id)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const id = change.doc.id;
            const data = change.doc.data();
            
            if (change.type === "removed") {
                delete otherPlayers[id];
            } else {
                if (!otherPlayers[id]) {
                    // INITIALIZE: Add the new equipment slots here!
                    otherPlayers[id] = { 
                        ...data, 
                        equipment: { 
                            body: new Image(), 
                            face: new Image(),
                            board: new Image(), // Added
                            extra: new Image(), // Added
                            pet: new Image()    // Added
                        } 
                    };
                }
                
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
                otherPlayers[id].name = data.name;
                
                // 1. Sync Shirt/Body
                if (data.bodySrc && otherPlayers[id].equipment.body.src !== data.bodySrc) {
                    otherPlayers[id].equipment.body.src = data.bodySrc;
                }
                // 2. Sync Hair/Face
                if (data.faceSrc && otherPlayers[id].equipment.face.src !== data.faceSrc) {
                    otherPlayers[id].equipment.face.src = data.faceSrc;
                }
                
                // 3. Sync BOARD
                if (data.boardSrc && otherPlayers[id].equipment.board.src !== data.boardSrc) {
                    otherPlayers[id].equipment.board.src = data.boardSrc;
                    otherPlayers[id].equipment.board.onload = () => { otherPlayers[id].equipment.board.complete = true; };
                } else if (!data.boardSrc) {
                    otherPlayers[id].equipment.board.src = ""; // Remove board if they unequip
                }

                // 4. Sync EXTRA (Moodies/Face Acc)
                if (data.extraSrc && otherPlayers[id].equipment.extra.src !== data.extraSrc) {
                    otherPlayers[id].equipment.extra.src = data.extraSrc;
                    otherPlayers[id].equipment.extra.onload = () => { otherPlayers[id].equipment.extra.complete = true; };
                }

                // 5. Sync PET
                if (data.petSrc && otherPlayers[id].equipment.pet.src !== data.petSrc) {
                    otherPlayers[id].equipment.pet.src = data.petSrc;
                }
            }
        });
    });
}

// --- 4. INPUT & CLICK DETECTION ---
mainCanvas.addEventListener('mousedown', (e) => {
    const rect = mainCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if we clicked the PLAYER
    const screenX = player.x - game.cameraX;
    const screenY = player.y;
    const dx = mouseX - screenX;
    const dy = mouseY - (screenY - 45); 
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
        // Use the ID Fone script function instead of a local override
        if (typeof openIdFone === "function") {
            openIdFone(player.id);
        }
    } else {
        // Move character if we didn't click the player
        player.targetX = mouseX + game.cameraX;
        player.targetY = mouseY;
    }
});

// --- 5. UI CONTROLS ---
function toggleInventory() {
    const inv = document.getElementById("inventory-window");
    if (!inv) return;
    inv.style.display = (inv.style.display === "none" || inv.style.display === "") ? "block" : "none";
}
const subCategories = {
    "tops": ["top", "bottom", "outfits", "costumes", "shoes"],
    "faceAcc": ["body", "face", "hair", "moodies", "face painting", "makeup", "earrings"],
    "hair": [],
    "board": [],
    "creature": []
};

async function filterInv(mainCat) {
    const subNav = document.getElementById('sub-nav-bar');
    const itemGrid = document.getElementById('item-grid');
    if (!subNav || !itemGrid) return;

    // 1. Clear current sub-nav
    subNav.innerHTML = "";

    // 2. Generate sub-buttons if they exist for this category
    if (subCategories[mainCat] && subCategories[mainCat].length > 0) {
        subCategories[mainCat].forEach(sub => {
            const btn = document.createElement('span');
            btn.innerText = sub;
            btn.style.cursor = "pointer";
            btn.style.textShadow = "1px 1px 2px rgba(0,0,0,0.5)";
            btn.onclick = () => loadFilteredItems(mainCat, sub);
            
            // Hover effect
            btn.onmouseover = () => btn.style.color = "#FFD700"; // Gold color on hover
            btn.onmouseout = () => btn.style.color = "white";

            subNav.appendChild(btn);
        });
        
        // Load the first sub-category by default (e.g., 'top')
        loadFilteredItems(mainCat, subCategories[mainCat][0]);
    } else {
        // No sub-categories (like Hair or Board), just load everything in that tab
        loadFilteredItems(mainCat);
    }
}

async function loadFilteredItems(mainCat, subCat = null) {
    const itemGrid = document.getElementById('item-grid');
    itemGrid.innerHTML = `<p style="color: #79B8E0; padding: 20px;">Loading...</p>`;

    try {
        let query = db.collection("users").doc(player.id).collection("inventory").where("type", "==", mainCat);
        
        // If there is a sub-category, filter by that too
        if (subCat) {
            query = query.where("subType", "==", subCat);
        }

        const snapshot = await query.get();
        itemGrid.innerHTML = "";

        if (snapshot.empty) {
            itemGrid.innerHTML = `<p style="color: #999; padding: 20px;">No items found.</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const item = doc.data();
            const slot = document.createElement('div');
            slot.className = "inv-item-slot";
            slot.style = "background: white; border: 2px solid #79B8E0; border-radius: 10px; height: 85px; width: 85px; display: flex; align-items: center; justify-content: center; cursor: pointer;";
            slot.innerHTML = `<img src="${item.icon}" style="max-width: 75px; max-height: 75px;">`;
            slot.onclick = () => equipItem(item);
            itemGrid.appendChild(slot);
        });
    } catch (err) {
        console.error("Query Error:", err);
    }
}
player.equipment = {
    body: new Image(),
    face: new Image(),
    board: new Image(), // MUST be an Image object, not null!
    extra: new Image()
};
function equipItem(item) {
    if (item.type === 'tops') {
        player.equipment.body.src = item.src;
        player.equipment.body.onload = () => updatePreview();
    } else if (item.type === 'hair') {
        player.equipment.face.src = item.src;
        player.equipment.face.onload = () => updatePreview();
    }
    else if (item.type === 'board') {
    // Use item.src because that's what your Firebase screenshot showed!
    player.equipment.board.src = item.src; 
    player.equipment.board.onload = () => {
        player.equipment.board.complete = true;
    };
}
}
function equipBoard(item) {
    player.equipment.board = new Image();
    // This pulls the file from the /animated/ folder
    player.equipment.board.src = item.sprite; 
    
    player.equipment.board.onload = () => {
        player.equipment.board.complete = true;
        console.log("Board Loaded.");
    };
}
// --- 6. GAME LOOP ---
function loop() {
    if (!game.active) return;
    
    // Smooth Movement
    player.x += (player.targetX - player.x) * 0.12;
    player.y += (player.targetY - player.y) * 0.12;
    game.cameraX = player.x - mainCanvas.width / 2;

    // Sync to Firebase every 30 frames
if (player.id && game.frameCount % 200 === 0) {
    db.collection("active_players").doc(player.id).set({
        x: Math.round(player.x),
        y: Math.round(player.y),
        name: player.name,
        bodySrc: player.equipment.body.src || "",
        faceSrc: player.equipment.face.src || "",
        // ADD THESE BELOW:
        boardSrc: player.equipment.board ? player.equipment.board.src : "",
        extraSrc: player.equipment.extra ? player.equipment.extra.src : "",
        petSrc: player.equipment.pet ? player.equipment.pet.src : ""
    }, { merge: true });
}
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    if (game.bg.complete) ctx.drawImage(game.bg, -game.cameraX, 0);

    Object.keys(otherPlayers).forEach(id => drawPlayer(otherPlayers[id]));
    drawPlayer(player);

    game.frameCount++;
    requestAnimationFrame(loop);
}
function drawPlayer(p) {
    const px = p.x - game.cameraX; 
    const py = p.y; 

    // 1. THE BOARD (Bottom Layer)
    if (p.equipment.board && p.equipment.board.complete) {
    let sW = 120;  
    let sH = 105;  // Increased from 95 to 105 to stop the bottom-clipping!
    
    // px - 60 is the sweet spot to center the puppy + board under her walking path
    let dX = px - 60; 
    
    // py - 122 pulls it up just a hair more to connect with her feet
    let dY = py - 122; 

    ctx.drawImage(
        p.equipment.board, 
        0, 0, sW, sH,  
        dX, dY, sW, sH 
    );
}
    // 2. THE BASE BODY (Skin)
    if (p.baseBody && p.baseBody.complete) {
        ctx.drawImage(p.baseBody, 0, 0, 52, 140, px - 26, py - 130, 52, 140);
    }

    // 3. THE SHIRTS
    if (p.equipment.body && p.equipment.body.complete && p.equipment.body.src) {
        ctx.drawImage(p.equipment.body, 0, 0, 55, 95, px - 24, py - 110, 55, 95);
    }

    // 4. FACE ACCESSORIES (Moodies/Makeup/Face Paint)
    if (p.equipment.extra && p.equipment.extra.complete) {
        // We draw this at the same position as the head
        ctx.drawImage(p.equipment.extra, 0, 0, 100, 85, px - 42, py - 126, 95, 85);
    }

    // 5. THE HEAD (Top Layer)
    if (p.baseHead && p.baseHead.complete) {
        ctx.drawImage(p.baseHead, 0, 0, 100, 85, px - 25, py - 137, 95, 85);
    }

    // 6. USERNAME (Don't move it!)
    ctx.textAlign = "center";
    ctx.font = "bold 14px Arial"; 
    ctx.fillStyle = "white";
    ctx.fillText(p.name || "User", px - 10, py - 15);
}
function startGame() {
    game.active = true;
    loop();
}

// Cleanup on leave
window.addEventListener("beforeunload", () => {
    if (player.id) db.collection("active_players").doc(player.id).delete();
});

// Force Loader Close
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}, 2000);