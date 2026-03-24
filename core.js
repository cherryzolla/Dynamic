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

const canvas = document.getElementById('prismCanvas');
const ctx = canvas.getContext('2d');

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

game.bg.src = "assets/rooms/Fantage_Downtown_BareBones.png";

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

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.targetX = (e.clientX - rect.left) + game.cameraX;
    player.targetY = (e.clientY - rect.top);
});

const chatInput = document.getElementById('chat-input');
if(chatInput) {
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== "") {
            const msg = chatInput.value;
            player.message = msg;
            chatInput.value = "";
            
            db.collection("active_players").doc(player.id).update({ message: msg });
            
            setTimeout(() => {
                player.message = "";
                if(player.id) {
                    db.collection("active_players").doc(player.id).update({ message: "" });
                }
            }, 10000); 
        }
    });
}

function startGame() {
    const loader = document.getElementById('loader');
    if (loader) { loader.style.display = 'none'; }
    game.active = true;
    loop();
}

function loop() {
    if (!game.active) return;
    game.frameCount++;

    player.x += (player.targetX - player.x) * 0.12;
    player.y += (player.targetY - player.y) * 0.12;
    game.cameraX = player.x - canvas.width / 2;

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (game.bg.complete && game.bg.naturalWidth !== 0) {
        ctx.drawImage(game.bg, -game.cameraX, 0);
    }

    Object.keys(otherPlayers).forEach(id => {
        const p = otherPlayers[id];
        if (p.img && p.img.complete) {
            ctx.drawImage(p.img, p.x - game.cameraX - (player.width/2), p.y - player.height, player.width, player.height);
            drawLabel(p.name, p.message, p.x, p.y);
        }
    });

    if (player.img.complete && player.img.naturalWidth !== 0) {
        ctx.drawImage(player.img, player.x - game.cameraX - (player.width/2), player.y - player.height, player.width, player.height);
        drawLabel(player.name, player.message, player.x, player.y);
    }

    requestAnimationFrame(loop);
}

function drawLabel(name, message, x, y) {
    const screenX = x - game.cameraX;
    
    if (message) {
        ctx.font = "14px Arial";
        const tw = ctx.measureText(message).width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; 
        ctx.beginPath();
        ctx.roundRect(screenX - (tw/2) - 10, y - player.height - 45, tw + 20, 30, 10);
        ctx.fill(); 
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(message, screenX, y - player.height - 25);
    }

    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(name, screenX, y + 25);
    ctx.fillText(name, screenX, y + 25);
}

document.getElementById('set-btn').addEventListener('click', () => {
    if(confirm("Logout of Dynamic?")) {
        db.collection("active_players").doc(player.id).delete().then(() => {
            return auth.signOut();
        }).then(() => {
            window.location.href = "index.html"; 
        }).catch(() => {
            window.location.href = "index.html";
        });
    }
});

window.addEventListener("beforeunload", () => {
    if (player.id) db.collection("active_players").doc(player.id).delete();
});