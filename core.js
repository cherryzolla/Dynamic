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
    frameW: 100, // Change this to your actual sprite frame width
    frameH: 100, // Change this to your actual sprite frame height
    currFrame: 0, // 0=Stand, 1=Walk, etc.
    name: "User",
    gender: "F",
    message: "",
    isWearingCostume: false,
    equipment: {
        board: new Image(),
        pet: new Image(),
        body: new Image(),
        bottoms: new Image(),
        tops: new Image(),
        shoes: new Image(),
        face: new Image(),
        faceAcc: new Image(),
        hair: new Image(),
        headAcc: new Image(),
        bodyAcc: new Image(),
        moodie: new Image(),
        friendship: new Image(),
        costume: new Image()
    }
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
            
            const skinNum = data.skinTone || 1;
            player.equipment.body.src = `assets/items/${player.gender.toLowerCase()}/body/orig-body-${skinNum}_orig.png`;
            player.equipment.face.src = `assets/items/${player.gender.toLowerCase()}/body/orig-face-${skinNum}_orig.png`;
            
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
                    otherPlayers[id] = { 
                        ...data, 
                        equipment: {} 
                    };
                }
                otherPlayers[id].x = data.x;
                otherPlayers[id].y = data.y;
                otherPlayers[id].message = data.message || "";
                otherPlayers[id].currFrame = data.currFrame || 0;
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
                if(player.id) db.collection("active_players").doc(player.id).update({ message: "" });
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
            currFrame: player.currFrame,
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
        drawCharacter(otherPlayers[id]);
    });

    drawCharacter(player);

    requestAnimationFrame(loop);
}

function drawCharacter(p) {
    const px = p.x - game.cameraX - (player.width / 2);
    const py = p.y - player.height;

    if (p.isWearingCostume && p.equipment.costume?.src) {
        renderLayer(p.equipment.board, px, py, p.currFrame);
        renderLayer(p.equipment.pet, px, py, p.currFrame);
        renderLayer(p.equipment.costume, px, py, p.currFrame);
    } else {
        const backLayers = ['board', 'pet'];
        const frontLayers = ['body', 'bottoms', 'tops', 'shoes', 'face', 'faceAcc', 'hair', 'headAcc', 'bodyAcc', 'moodie', 'friendship'];
        
        backLayers.forEach(layer => renderLayer(p.equipment[layer], px, py, p.currFrame));
        frontLayers.forEach(layer => renderLayer(p.equipment[layer], px, py, p.currFrame));
    }

    drawLabel(p.name, p.message, p.x, p.y);
}

function renderLayer(imgObj, x, y, frame) {
    if (!imgObj || !imgObj.complete || !imgObj.src) return;
    ctx.drawImage(
        imgObj,
        frame * player.frameW, 0, 
        player.frameW, player.frameH,
        x, y, 
        player.width, player.height
    );
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
// 🎒 OPEN INVENTORY
const invBtn = document.getElementById('inv-btn');
const invWindow = document.getElementById('inventory-window');
const closeInv = document.getElementById('close-inv');

if (invBtn) {
    invBtn.addEventListener('click', () => {
        invWindow.style.display = (invWindow.style.display === 'none') ? 'block' : 'none';
    });
}

// ❌ CLOSE INVENTORY
if (closeInv) {
    closeInv.addEventListener('click', () => {
        invWindow.style.display = 'none';
    });
}