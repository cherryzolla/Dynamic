const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 400,
    y: 300,
    username: "User",
    currentOutfit: { body: 'body_f', hair: 'none', tops: 'none' }
};

// This matches the order things are stacked (Body on bottom, Hair on top)
const LAYER_ORDER = ['body', 'tops', 'hair'];

function initEngine(userData) {
    player.username = userData.username;
    player.currentOutfit = userData.currentOutfit;
    gameLoop();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer(player);
    requestAnimationFrame(gameLoop);
}

function drawPlayer(p) {
    LAYER_ORDER.forEach(layer => {
        const itemId = p.currentOutfit[layer];
        if (itemId && itemId !== 'none') {
            const imgPath = getItemPath(itemId); // From assets.js
            const img = new Image();
            img.src = imgPath;
            // Draw centered at player position
            ctx.drawImage(img, p.x - 50, p.y - 100, 100, 150); 
        }
    });

    // Draw Username Label
    ctx.font = "bold 14px Quicksand";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(p.username, p.x, p.y + 70);
}

function sendChat(msg) {
    console.log(`${player.username} says: ${msg}`);
    // Future: Logic to show a speech bubble!
}