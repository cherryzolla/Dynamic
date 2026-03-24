/**
 * PRISM ENGINE - Core Rendering
 */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 400,
    y: 300,
    username: "Traveler",
    currentOutfit: { body: 'none', hair: 'none', tops: 'none' }
};

const LAYER_ORDER = ['body', 'tops', 'hair'];

function initEngine(userData) {
    console.log("🌸 Engine Received User Data:", userData);
    
    // Match the field names from your Firestore
    player.username = userData.username || "New User";
    player.currentOutfit = userData.currentOutfit || { body: 'none' };
    
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
            // Inside engine.js -> drawPlayer function
const itemId = p.currentOutfit[layer];
const imgPath = getItemPath(itemId);
            
            if (imgPath) {
                const img = new Image();
                img.src = imgPath;
                // Draw centered at player position
                ctx.drawImage(img, p.x - 50, p.y - 100, 100, 150); 
            }
        }
    });

    // Draw Name Label
    ctx.font = "bold 16px 'Quicksand', sans-serif";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    
    // Outline for readability
    ctx.strokeText(p.username, p.x, p.y + 70);
    ctx.fillText(p.username, p.x, p.y + 70);
}