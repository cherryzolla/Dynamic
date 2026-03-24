// 1. Firebase Configuration
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
    message: "",
    img: new Image()
};

let otherPlayers = {}; 

// 4. Asset Setup 
// IMPORTANT: Check your actual filenames! GitHub is case-sensitive.
game.bg.src = "assets/rooms/fntg-full-map-barebones.pngg";

// 5. Auth & Data Fetching
auth.onAuthStateChanged(user => {
    if (user) {
        player.id = user.uid;
        db.collection("users").doc(user.uid).get().then(doc => {
            const data = doc.data() || {};
            player.name = data.username || "Traveler";
            player.gender = data.gender || "F";
            
            player.img.src = player.gender === "M" ? 
                "assets/items/boy/body/fantage-boy-outline.png" : 
                "assets/items/girl/body/fantage-girl-outline.png";
            
            startMultiplayer();
            startGame();
        }).catch(err => console.error("Error fetching user:", err));
    } else {
        window.location.href = "index.html";
    }
});

// 6. Multiplayer Listener
function startMultiplayer() {
    db.collection("active_players").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = change.doc.id;
            if (id === player.id) return;

            if (change.type === "removed") {
                delete otherPlayers[id];
            } else {
                if (!otherPlayers[id]) {
                    otherPlayers[id] = { ...data, img: new Image() };
                    otherPlayers[id].img.src = data.gender === "M" ? 
                        "assets/items/boy/body/fantage-boy-outline.png" : 
                        "assets/items/girl/body/fantage-girl-outline.png";
                }
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
                otherPlayers[id].message = data.message || "";
            }
        });
    });
}

// 7. Input & Chat
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.targetX = (e.clientX - rect.left) + game.cameraX;
    player.targetY = (e.clientY - rect.top);
});

const chatInput = document.getElementById('chat-input');
if(chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== "") {
            player.message = chatInput.value;
            chatInput.value = "";
            db.collection("active_players").doc(player.id).update({ message: player.message });
            setTimeout(() => {
                player.message = "";
                if(player.id) db.collection("active_players").doc(player.id).update({ message: "" });
            }, 5000);
        }
    });
}

function startGame() {
    const loader = document.getElementById('loader');
    if (loader) { loader.style.display = 'none'; }
    game.active = true;
    loop();
}

// 8. Main Loop
function loop() {
    if (!game.active) return;
    game.frameCount++;

    // Movement
    player.x += (player.targetX - player.x) * 0.12;
    player.y += (player.targetY - player.y) * 0.12;
    game.cameraX = player.x - canvas.width / 2;

    // Sync to Firebase
    if (player.id && game.frameCount % 6 === 0) {
        db.collection("active_players").doc(player.id).set({
            x: Math.round(player.x),
            y: Math.round(player.y),
            name: player.name,
            gender: player.gender,
            message: player.message,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    // --- RENDER ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw BG with Safety Gate
    if (game.bg.complete && game.bg.naturalWidth !== 0) {
        ctx.drawImage(game.bg, -game.cameraX, 0);
    } else {
        ctx.fillStyle = "#87CEEB"; // Fallback sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw Others
    Object.keys(otherPlayers).forEach(id => {
        const p = otherPlayers[id];
        if (p.img && p.img.complete && p.img.naturalWidth !== 0) {
            ctx.drawImage(p.img, p.x - game.cameraX - (player.width/2), p.y - player.height, player.width, player.height);
            drawLabel(p.name, p.message, p.x, p.y);
        }
    });

    // Draw Self
    if (player.img.complete && player.img.naturalWidth !== 0) {
        ctx.drawImage(player.img, player.x - game.cameraX - (player.width/2), player.y - player.height, player.width, player.height);
        drawLabel(player.name, player.message, player.x, player.y);
    } else {
        // Fallback: Draw a pink square if player image fails
        ctx.fillStyle = "#ff8fb1";
        ctx.fillRect(player.x - game.cameraX - 10, player.y - 20, 20, 20);
    }

    requestAnimationFrame(loop);
}

function drawLabel(name, message, x, y) {
    const screenX = x - game.cameraX;
    
    // Speech Bubble
    if (message) {
        ctx.font = "14px Arial";
        const tw = ctx.measureText(message).width;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "#ff8fb1";
        ctx.beginPath();
        ctx.roundRect(screenX - (tw/2) - 10, y - player.height - 40, tw + 20, 30, 10);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(message, screenX, y - player.height - 20);
    }

    // Name
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(name, screenX, y + 20);
    ctx.fillText(name, screenX, y + 20);
}

// 9. UI Buttons
document.getElementById('set-btn').addEventListener('click', () => {
    if(confirm("Logout?")) {
        db.collection("active_players").doc(player.id).delete().then(() => auth.signOut());
    }
});