const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 400,
    y: 300,
    targetX: 400, // Where the player IS GOING
    targetY: 300,
    speed: 0.15,  // How fast they glide (0.1 to 0.2 is best)
    username: "Traveler",
    currentOutfit: { body: 'body_f', hair: 'none', tops: 'none' }
};

const LAYER_ORDER = ['body', 'tops', 'hair'];

// --- CLICK TO WALK ---
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Calculate exactly where the mouse clicked inside the canvas
    player.targetX = e.clientX - rect.left;
    player.targetY = e.clientY - rect.top;
    
    console.log(`Walking to: ${player.targetX}, ${player.targetY}`);
});

async function initEngine(userData) {
    const statusText = document.getElementById('load-status');
    const loader = document.getElementById('game-loader');

    try {
        player.username = userData.username || "User";
        player.currentOutfit = userData.currentOutfit || { body: 'body_f' };

        // Pre-load the body so it doesn't flicker
        await loadItemImage(player.currentOutfit.body);

        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 800);
        }
        gameLoop();
    } catch (err) {
        console.error("Init Error:", err);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updateMovement(); // Move the player slightly every frame
    drawPlayer(player);
    
    requestAnimationFrame(gameLoop);
}

function updateMovement() {
    // Smooth Glide (Linear Interpolation)
    const dx = player.targetX - player.x;
    const dy = player.targetY - player.y;

    if (Math.abs(dx) > 1) player.x += dx * player.speed;
    if (Math.abs(dy) > 1) player.y += dy * player.speed;
}

function drawPlayer(p) {
    LAYER_ORDER.forEach(layer => {
        const itemId = p.currentOutfit[layer];
        if (itemId && itemId !== 'none') {
            const imgPath = getItemPath(itemId);
            if (imgPath) {
                const img = new Image();
                img.src = imgPath;
                if (img.complete) {
                    ctx.drawImage(img, p.x - 50, p.y - 100, 100, 150);
                }
            }
        }
    });

    // Username Label
    ctx.font = "bold 16px 'Quicksand'";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(p.username, p.x, p.y + 70);
    ctx.fillStyle = "white";
    ctx.fillText(p.username, p.x, p.y + 70);
}