const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 400, y: 300,
    targetX: 400, targetY: 300,
    speed: 0.15,
    width: 60,  // 🌸 SHRUNK: Was 100
    height: 90, // 🌸 SHRUNK: Was 150
    username: "User",
    currentOutfit: { body: 'body_f' }
};

let camera = { x: 0, y: 0 };
let bgImage = new Image();
bgImage.src = "assets/rooms/downtown.png"; // Default background

// --- CLICK TO WALK ---
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    // We add camera.x/y so you click the WORLD, not just the screen
    player.targetX = (e.clientX - rect.left) + camera.x;
    player.targetY = (e.clientY - rect.top) + camera.y;
});

async function initEngine(userData) {
    player.username = userData.username || "User";
    player.currentOutfit = userData.currentOutfit || { body: 'body_f' };
    
    // Hide Loader
    const loader = document.getElementById('game-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 800);
    }
    gameLoop();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Update Camera to follow player (Centered)
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // 2. Draw Background (Offset by camera)
    ctx.drawImage(bgImage, -camera.x, -camera.y);

    // 3. Move & Draw Player
    updateMovement();
    drawPlayer(player);

    requestAnimationFrame(gameLoop);
}

function updateMovement() {
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;
    if (Math.abs(dx) > 1) player.x += dx * player.speed;
    if (Math.abs(dy) > 1) player.y += dy * player.speed;
}

function drawPlayer(p) {
    const LAYER_ORDER = ['body', 'tops', 'hair'];
    
    LAYER_ORDER.forEach(layer => {
        const itemId = p.currentOutfit[layer];
        const imgPath = getItemPath(itemId);
        if (imgPath) {
            const img = new Image();
            img.src = imgPath;
            if (img.complete) {
                // Draw at shrunk size, offset by camera
                ctx.drawImage(img, p.x - camera.x - (p.width/2), p.y - camera.y - p.height, p.width, p.height);
            }
        }
    });

    // Username (moves with camera)
    ctx.font = "bold 14px 'Quicksand'";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(p.username, p.x - camera.x, p.y - camera.y + 20);
    ctx.fillStyle = "white";
    ctx.fillText(p.username, p.x - camera.x, p.y - camera.y + 20);
}