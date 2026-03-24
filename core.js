// 1. Firebase Config (Keep your existing config here)
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

let otherPlayers = {}; // 👥 THE MULTIPLAYER LIST

// 4. Asset Setup
game.bg.src = "assets/rooms/fntg-full-map-barebones.png";

// 5. Auth & Data Fetching
auth.onAuthStateChanged(user => {
    if (user) {
        player.id = user.uid;
        db.collection("users").doc(user.uid).get().then(doc => {
            const data = doc.data() || {};
            player.name = data.username || "Traveler";
            player.gender = data.gender || "F";
            
            // Load correct body
            player.img.src = player.gender === "M" ? 
                "assets/items/boy/body/fantage-boy-outline.png" : 
                "assets/items/girl/body/fantage-girl-outline.png";
            
            startMultiplayer(); // Start listening for others
            startGame();
        });
    } else {
        window.location.href = "index.html";
    }
});

// 6. Multiplayer Syncing
function startMultiplayer() {
    // Listen for everyone in the "active_players" collection
    db.collection("active_players").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = change.doc.id;

            if (id === player.id) return; // Skip drawing yourself

            if (change.type === "removed") {
                delete otherPlayers[id];
            } else {
                if (!otherPlayers[id]) {
                    otherPlayers[id] = { ...data, img: new Image() };
                    otherPlayers[id].img.src = data.gender === "M" ? 
                        "assets/items/boy/body/fantage-boy-outline.png" : 
                        "assets/items/girl/body/fantage-girl-outline.png";
                }
                // Update their position
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
            }
        });
    });
}

// 7. Input
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.targetX = (e.clientX - rect.left) + game.cameraX;
    player.targetY = (e.clientY - rect.top);
});

function startGame() {
    document.getElementById('loader').style.display = 'none';
    game.active = true;
    loop();
}

// 8. Main Loop
function loop() {
    if (!game.active) return;
    game.frameCount++;

    // Local Movement
    player.x += (player.targetX - player.x) * 0.1;
    player.y += (player.targetY - player.y) * 0.1;
    game.cameraX = player.x - canvas.width / 2;

    // --- 📡 SEND POSITION TO FIREBASE (Every 6 frames) ---
    if (game.frameCount % 6 === 0) {
        db.collection("active_players").doc(player.id).set({
            x: player.x,
            y: player.y,
            name: player.name,
            gender: player.gender,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Map
    if (game.bg.complete) ctx.drawImage(game.bg, -game.cameraX, 0);

    // Draw Others
    Object.keys(otherPlayers).forEach(id => {
        const p = otherPlayers[id];
        if (p.img.complete) {
            ctx.drawImage(p.img, p.x - game.cameraX - (player.width/2), p.y - player.height, player.width, player.height);
            drawLabel(p.name, p.x, p.y);
        }
    });

    // Draw Local Player
    if (player.img.complete) {
        ctx.drawImage(player.img, player.x - game.cameraX - (player.width/2), player.y - player.height, player.width, player.height);
        drawLabel(player.name, player.x, player.y);
    }

    requestAnimationFrame(loop);
}

function drawLabel(name, x, y) {
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(name, x - game.cameraX, y + 20);
    ctx.fillText(name, x - game.cameraX, y + 20);
}

// 9. UI Buttons
document.getElementById('set-btn').addEventListener('click', () => {
    if(confirm("Logout?")) {
        // Remove from active players before leaving
        db.collection("active_players").doc(player.id).delete().then(() => {
            auth.signOut();
        });
    }
});