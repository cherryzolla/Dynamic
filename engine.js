/**
 * PRISM ENGINE - Master Game Logic
 * Handles Rendering, Movement, and the "In-Game" Loading Screen.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- PLAYER STATE ---
let player = {
    x: 400, // Starting position (Middle of the 800px canvas)
    y: 300,
    username: "Traveler",
    currentOutfit: { 
        body: 'none', 
        hair: 'none', 
        tops: 'none' 
    }
};

// The order items are stacked: Body first, then Clothes, then Hair on top.
const LAYER_ORDER = ['body', 'tops', 'hair'];

/**
 * INITIALIZE ENGINE
 * This is called by play.html once Firebase data is ready.
 */
async function initEngine(userData) {
    const statusText = document.getElementById('load-status');
    const loader = document.getElementById('game-loader');

    console.log("🌸 Engine received data for:", userData.username);

    try {
        // 1. Update status for the user
        if(statusText) statusText.innerText = "Dressing Character...";
        
        player.username = userData.username || "New User";
        player.currentOutfit = userData.currentOutfit || { body: 'body_f' };

        // 2. Pre-load the Base Body (Prevents "Invisible Character" bug)
        const bodyId = player.currentOutfit.body;
        if (bodyId && bodyId !== 'none') {
            await loadItemImage(bodyId); // Uses the Promise from assets.js
        }

        // 3. Success! Fade out the Loading GIF
        if(statusText) statusText.innerText = "Entering Downtown...";
        
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { 
                loader.style.display = 'none'; 
            }, 800);
        }

        // 4. Start the Animation Loop
        gameLoop();

    } catch (err) {
        if(statusText) statusText.innerText = "Error loading assets! 🌸";
        console.error("Engine Start Error:", err);
    }
}

/**
 * GAME LOOP
 * Runs at ~60 frames per second to keep the canvas updated.
 */
function gameLoop() {
    // Clear the canvas so we don't leave "trails"
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw everything
    drawPlayer(player);
    
    // Keep the loop going
    requestAnimationFrame(gameLoop);
}

/**
 * DRAW PLAYER
 * Handles the layered "Fantage" style paper-doll rendering.
 */
function drawPlayer(p) {
    if (!p || !p.currentOutfit) return;

    LAYER_ORDER.forEach(layer => {
        const itemId = p.currentOutfit[layer];
        
        if (itemId && itemId !== 'none') {
            const imgPath = getItemPath(itemId); // Calls helper from assets.js
            
            if (imgPath) {
                const img = new Image();
                img.src = imgPath;

                // Draw the item centered on the player's X/Y
                // 100x150 is a standard size for Fantage-style sprites
                ctx.drawImage(img, p.x - 50, p.y - 100, 100, 150);
            }
        }
    });

    // --- DRAW USERNAME ---
    ctx.font = "bold 16px 'Quicksand', sans-serif";
    ctx.textAlign = "center";
    
    // Black outline for "Fantage" readability
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(p.username, p.x, p.y + 70);
    
    // White fill
    ctx.fillStyle = "white";
    ctx.fillText(p.username, p.x, p.y + 70);
}

/**
 * MOVE PLAYER (Future Logic)
 * We can call this later to make the character walk!
 */
function movePlayer(newX, newY) {
    player.x = newX;
    player.y = newY;
}