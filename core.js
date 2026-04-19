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

// Main Game Canvas
const mainCanvas = document.getElementById('prismCanvas');
const ctx = mainCanvas.getContext('2d'); 
const canvas = mainCanvas;

// Inventory Preview Canvas
const previewCanvas = document.getElementById('previewCanvas');
const pCtx = previewCanvas.getContext('2d');

let game = { active: false, cameraX: 0, bg: new Image(), frameCount: 0 };
game.bg.src = "assets/rooms/Fantage_Downtown_BareBones.png";

let player = {
    id: null, x: 400, y: 380, targetX: 400, targetY: 380,
    width: 60, height: 95, name: "User", gender: "F",
    equipment: { body: new Image(), face: new Image() }
};

let otherPlayers = {}; 

// 1. AUTH & DATA LOAD
auth.onAuthStateChanged(user => {
    if (user) {
        player.id = user.uid;
        db.collection("users").doc(user.uid).get().then(doc => {
            const data = doc.data() || {};
            player.name = data.username || "Traveler";
            
            let g = data.gender ? data.gender.toUpperCase() : "F";
            player.gender = (g === "M" || g === "BOY") ? "M" : "F";

            if (player.gender === "M") {
                player.equipment.body.src = `assets/items/boy/body/orig-body-1-1_orig.png`; 
                player.equipment.face.src = `assets/items/boy/body/orig-face-1-1_orig.png`;
            } else {
                player.equipment.body.src = `assets/items/girl/body/orig-body-1_orig.png`;
                player.equipment.face.src = `assets/items/girl/body/orig-face-1_orig.png`;
            }

            startMultiplayer();
            startGame();
        });
    } else {
        window.location.href = "index.html";
    }
});

// 2. MULTIPLAYER SNAPSHOTS
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
                    otherPlayers[id] = { 
                        ...data, 
                        equipment: { body: new Image(), face: new Image() } 
                    };
                }
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
                otherPlayers[id].name = data.name;
                
                if (data.bodySrc && otherPlayers[id].equipment.body.src !== data.bodySrc) {
                    otherPlayers[id].equipment.body.src = data.bodySrc;
                }
                if (data.faceSrc && otherPlayers[id].equipment.face.src !== data.faceSrc) {
                    otherPlayers[id].equipment.face.src = data.faceSrc;
                }
            }
        });
    });
}

// 3. INPUT
mainCanvas.addEventListener('mousedown', (e) => {
    const rect = mainCanvas.getBoundingClientRect();
    player.targetX = (e.clientX - rect.left) + game.cameraX;
    player.targetY = (e.clientY - rect.top);
});
// Add this to your main script
prismCanvas.addEventListener('mousedown', (e) => {
    const rect = prismCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Use your player variable name (player, localPlayer, etc.)
    const screenX = player.x - (window.gameCameraX || 0);
    const screenY = player.y;

    const dx = mouseX - screenX;
    const dy = mouseY - (screenY - 45); 
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
        // Instead of the red box, we call the IdFone!
        openMyIdFone();
    }
});
function openMyIdFone() {
    const fone = document.getElementById("id-fone-overlay");
    
    // Fill it with your "perfect" character's info
    fone.innerHTML = `
        <div class="idfone-wrapper">
            <div class="idfone-header">
                <span>${player.username || "Player"}</span>
            </div>
            <div class="idfone-body">
                <div class="idfone-stats">
                    <p>Level: ${player.level || 1}</p>
                    <p>Stars: ${player.stars || 0}</p>
                </div>
                <div class="idfone-bio">
                    ${player.bio || "Building something cool..."}
                </div>
                <button class="idfone-btn" onclick="closeIdFone()">CLOSE</button>
            </div>
        </div>
    `;
    
    fone.style.display = "block";
}

function closeIdFone() {
    document.getElementById("id-fone-overlay").style.display = "none";
}

// 4. MAIN LOOP
function loop() {
    if (!game.active) return;
    
    player.x += (player.targetX - player.x) * 0.12;
    player.y += (player.targetY - player.y) * 0.12;
    game.cameraX = player.x - mainCanvas.width / 2;

    if (player.id && game.frameCount % 30 === 0) {
        db.collection("active_players").doc(player.id).set({
            x: Math.round(player.x),
            y: Math.round(player.y),
            name: player.name,
            bodySrc: player.equipment.body.src,
            faceSrc: player.equipment.face.src
        }, { merge: true });
    }

    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    if (game.bg.complete) ctx.drawImage(game.bg, -game.cameraX, 0);

    Object.keys(otherPlayers).forEach(id => drawPlayer(otherPlayers[id]));
    drawPlayer(player);

    game.frameCount++;
    requestAnimationFrame(loop);
}

// 5. DRAWING LOGIC (The Sprite Clipping Fix)
function drawPlayer(p) {
    const px = p.x - game.cameraX; 
    const py = p.y; 

    // --- STEP 1: THE CUT (Body) ---
    const b_sw = 55;   
    const b_sh = 95;   

    // --- STEP 2: THE SIZE (General) ---
    const charWidth = 60;  
    const charHeight = 90; 

    // --- STEP 3: THE DRAW (Body) ---
    if (p.equipment.body.complete && p.equipment.body.naturalWidth > 0) {
        ctx.drawImage(
            p.equipment.body, 
            0, 0, b_sw, b_sh, 
            px - (charWidth / 2), py - charHeight, charWidth, charHeight    
        );
    }

    // --- STEP 4: FACE CALIBRATION ---
    const f_sw = 100; 
    const f_sh = 85;  
    const f_dw = 95;  
    const f_dh = 85;  

    if (p.equipment.face.complete && p.equipment.face.naturalWidth > 0) {
        ctx.drawImage(
            p.equipment.face, 
            0, 0, f_sw, f_sh, 
            // Nudging right by +25 to line up with the neck
            (px - (f_dw / 2)) + 21, 
            // py - charHeight anchors it to the body height
            py - charHeight - 10, 
            f_dw, 
            f_dh 
        );
    }


    // 4. NAME TAG (Board-Ready Spacing)
         ctx.textAlign = "center";
        ctx.font = "bold 14px Arial"; // Standard Fantage font style

        // Create the classic dark "halo" effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)"; 
        ctx.shadowBlur = 3; 
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;

        // Fill the text
        ctx.fillStyle = "white";

        // THE GAP: Using py + 45 ensures the name stays below the feet/board area
        // so it doesn't look weirdly cut off by the legs.
        ctx.fillText(p.name || "User", px, py + 45);

        // CRITICAL: Reset shadows so they don't make your player sprites look "glowy"
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
}

function startGame() {
    game.active = true;
    loop();
}
async function openIdFone(userId) {
    // Since we did 'window.db = db' earlier, we use that here
    const userRef = window.db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (doc.exists) {
        const data = doc.data();
        const fone = document.getElementById("id-fone-overlay");

        // Inject the data into your HTML structure
        fone.innerHTML = `
            <div class="idfone-container">
                <div class="idfone-header">${data.username}</div>
                <div class="idfone-content">
                    <p>Level: ${data.level || 1}</p>
                    <p>Stars: ${data.stars || 0}</p>
                    <p class="bio">${data.bio || "No bio set."}</p>
                </div>
                <button onclick="this.parentElement.parentElement.style.display='none'">Close</button>
            </div>
        `;
        
        fone.style.display = "block";
    }
}
window.addEventListener("beforeunload", () => {
    if (player.id) db.collection("active_players").doc(player.id).delete();
});
// EMERGENCY OVERRIDE: Force the loader to hide after 2 seconds
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
        console.log("Loader forced closed. Check for missing assets!");
    }
}, 2000);