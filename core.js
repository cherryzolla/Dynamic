// 1. Firebase Configuration (Matches your "dynamic-40949" project)
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

// 2. Setup Canvas
const canvas = document.getElementById('prismCanvas');
const ctx = canvas.getContext('2d');

// 3. Game State
let game = {
    active: false,
    cameraX: 0,
    bg: new Image(),
    frameCount: 0
};

let player = {
    id: null,
    x: 400, y: 380,
    targetX: 400, targetY: 380,
    width: 60, height: 95,
    name: "User",
    gender: "F",
    img: new Image()
};

let otherPlayers = {}; // List for multiplayer "ghosts"

// 4. Asset Setup (Using your exact filenames from the screenshot)
game.bg.src = "assets/rooms/fntg-full-map-barebones.png";

// 5. Auth & Data Fetching
auth.onAuthStateChanged(user => {
    if (user) {
        player.id = user.uid; // Store UID for the multiplayer document
        
        db.collection("users").doc(user.uid).get().then(doc => {
            const data = doc.data() || {};
            player.name = data.username || "Traveler";
            player.gender = data.gender || "F";
            
            // Logic: Pick the right folder based on gender
            player.img.src = player.gender === "M" ? 
                "assets/items/boy/body/fantage-boy-outline.png" : 
                "assets/items/girl/body/fantage-girl-outline.png";
            
            startMultiplayer(); // Start the live listener
            startGame();
        }).catch(err => console.error("Error fetching user data:", err));
    } else {
        window.location.href = "index.html"; // Kick to login if not authenticated
    }
});

// 6. Multiplayer Syncing (The "Live Listener")
function startMultiplayer() {
    db.collection("active_players").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = change.doc.id;

            if (id === player.id) return; // Don't draw yourself twice

            if (change.type === "removed") {
                delete otherPlayers[id];
            } else {
                if (!otherPlayers[id]) {
                    otherPlayers[id] = { ...data, img: new Image() };
                    // Assign gender-correct image for other players
                    otherPlayers[id].img.src = data.gender === "M" ? 
                        "assets/items/boy/body/fantage-boy-outline.png" : 
                        "assets/items/girl/body/fantage-girl-outline.png";
                }
                // Update their coordinates live
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
            }
        });
    }, err => console.error("Multiplayer Listener Error:", err));
}

// 7. Input Handling
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.targetX = (e.clientX - rect.left) + game.cameraX;
    player.targetY = (e.clientY - rect.top);
});

function startGame() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
    game.active = true;
    loop();
}

// 8. The Main Game Loop
function loop() {
    if (!game.active) return;
    game.frameCount++;

    // Local Movement
    player.x += (player.targetX - player.x) * 0.12;
    player.y += (player.targetY - player.y) * 0.12;
    
    // Camera centers on player
    game.cameraX = player.x - canvas.width / 2;

    // --- 📡 SEND POSITION TO FIREBASE ---
    // This creates the "active_players" collection if it doesn't exist!
    if (player.id && game.frameCount % 6 === 0) {
        db.collection("active_players").doc(player.id).set({
            x: Math.round(player.x),
            y: Math.round(player.y),
            name: player.name,
            gender: player.gender,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => console.error("Sync Error:", err));
    }

    // Render Everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Map
    if (game.bg.complete) {
        ctx.drawImage(game.bg, -game.cameraX, 0);
    }

    // 2. Draw Other Players
    Object.keys(otherPlayers).forEach(id => {
        const p = otherPlayers[id];
        if (p.img && p.img.complete) {
            ctx.drawImage(p.img, p.x - game.cameraX - (player.width/2), p.y - player.height, player.width, player.height);
            drawLabel(p.name, p.x, p.y);
        }
    });

    // 3. Draw Local Player
    if (player.img.complete) {
        ctx.drawImage(player.img, player.x - game.cameraX - (player.width/2), player.y - player.height, player.width, player.height);
        drawLabel(player.name, player.x, player.y);
    }

    requestAnimationFrame(loop);
}

// Helper: Draw Username Labels
function drawLabel(name, x, y) {
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(name, x - game.cameraX, y + 20);
    ctx.fillText(name, x - game.cameraX, y + 20);
}

// 9. UI Button Listeners
document.getElementById('inv-btn').addEventListener('click', () => alert("Inventory ✨"));
document.getElementById('map-btn').addEventListener('click', () => alert("Map 🌸"));
document.getElementById('set-btn').addEventListener('click', () => {
    if(confirm("Log out?")) {
        // Clean up: Remove your character from the map when you leave
        db.collection("active_players").doc(player.id).delete().then(() => {
            auth.signOut();
        });
    }
});