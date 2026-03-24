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
    bg: new Image()
};

let player = {
    x: 400, y: 380,
    targetX: 400, targetY: 380,
    width: 60, height: 95,
    name: "User",
    img: new Image()
};
let otherPlayers = {}; // This will hold everyone else's data
// 4. Set Initial Image Paths
game.bg.src = "assets/rooms/Fantage_Downtown_BareBones.png";
player.img.src = "assets/items/girl/body/fantage-girl-outline.png";

// 5. Movement Logic
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.targetX = (e.clientX - rect.left) + game.cameraX;
    player.targetY = (e.clientY - rect.top);
});

// 6. Authentication & Start
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("users").doc(user.uid).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                player.name = userData.username || "Traveler";
                
                // 👦 THE SWITCH LOGIC 👧
                if (userData.gender === "M") {
                    player.img.src = "assets/items/boy/body/fantage-boy-outline.png";
                } else {
                    player.img.src = "assets/items/girl/body/fantage-girl-outline.png";
                }

                startGame();
            }
        });
    } else {
        window.location.href = "index.html";
    }
});

function startGame() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 500);
    game.active = true;
    loop();
}

// 7. The Main Game Loop
function loop() {
    if (!game.active) return;

    // Update Physics
    player.x += (player.targetX - player.x) * 0.1;
    player.y += (player.targetY - player.y) * 0.1;
    game.cameraX = player.x - canvas.width / 2;

    // Render (Draw)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Background
    ctx.drawImage(game.bg, -game.cameraX, 0);

    // Draw Player
    ctx.drawImage(player.img, player.x - game.cameraX - (player.width/2), player.y - player.height, player.width, player.height);
    // Inside the draw section of loop()
    Object.keys(otherPlayers).forEach(id => {
    const p = otherPlayers[id];
    if (p.img.complete) {
        ctx.drawImage(p.img, p.x - game.cameraX - (player.width/2), p.y - player.height, player.width, player.height);
        
        // Draw their name too
        ctx.fillText(p.name, p.x - game.cameraX, p.y + 20);
    }
    });
    // Draw Username
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(player.name, player.x - game.cameraX, player.y + 20);
    ctx.fillText(player.name, player.x - game.cameraX, player.y + 20);

    requestAnimationFrame(loop);
    // Inside loop()
    if (game.active && frameCount % 6 === 0) { // frameCount is a new counter we'll add
    db.collection("active_players").doc(auth.currentUser.uid).set({
        x: player.x,
        y: player.y,
        name: player.name,
        gender: player.gender,
        lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });}
}
function startMultiplayer() {
    db.collection("active_players").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = change.doc.id;

            // Don't draw yourself twice!
            if (id === auth.currentUser.uid) return;

            if (change.type === "removed") {
                delete otherPlayers[id];
            } else {
                // If they don't have an image loaded yet, create one
                if (!otherPlayers[id]) {
                    otherPlayers[id] = data;
                    otherPlayers[id].img = new Image();
                    otherPlayers[id].img.src = data.gender === "M" ? 
                        "assets/items/boy/body/fantage-boy-outline.png" : 
                        "assets/items/girl/body/fantage-girl-outline.png";
                }
                // Update their coordinates
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
            }
        });
    });
}
// 8. UI Button Wiring
document.getElementById('inv-btn').addEventListener('click', () => alert("Inventory ✨"));
document.getElementById('map-btn').addEventListener('click', () => alert("Map 🌸"));
document.getElementById('set-btn').addEventListener('click', () => {
    if(confirm("Logout?")) auth.signOut();
});