/**
 * PRISM ENGINE - Master Asset Registry
 * This file maps Item IDs to their metadata and file paths.
 */

const ITEM_DATABASE = {
    // --- BODIES (The Base Outlines) ---
    "body_f": { name: "Base Girl", layer: "body", gender: "F", src: "assets/items/girl/body/fantage-girl-outline.png" },
    "body_m": { name: "Base Boy", layer: "body", gender: "M", src: "assets/items/boy/body/fantage-boy-outline.png" },

    // --- HAIR ---
    "h_pink_01": { name: "Pink Side Pony", layer: "hair", gender: "F", rarity: "Common" },
    "h_cool_01": { name: "Spiky Blue", layer: "hair", gender: "M", rarity: "Common" },

    // --- TOPS ---
    "t_ribbon_01": { name: "Pink Ribbon Tee", layer: "tops", gender: "F", rarity: "Common" },
    "t_hoodie_01": { name: "Blue Streak Hoodie", layer: "tops", gender: "M", rarity: "Common" },

    // --- BOARDS (Fantage Style!) ---
    "b_star_01": { name: "Yellow Star Board", layer: "boards", gender: "U", rarity: "Rare" } 
};

/**
 * Helper function to construct the file path dynamically.
 * Standardizes folder structure: assets/items/[gender]/[layer]/[id].png
 */
function getItemPath(itemId) {
    const item = ITEM_DATABASE[itemId];
    if (!item) return null;

    // If a specific source is already defined (like for bodies), use it.
    if (item.src) return item.src;

    // Handle "Universal" items (U) or Gender-specific
    const genderFolder = item.gender === "M" ? "boy" : (item.gender === "F" ? "girl" : "unisex");
    return `assets/items/${genderFolder}/${item.layer}/${itemId}.png`;
}

/**
 * Preloader function to ensure images are ready before drawing to canvas.
 */
function loadItemImage(itemId) {
    return new Promise((resolve, reject) => {
        const path = getItemPath(itemId);
        if (!path) reject("Item not found");

        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => reject("Failed to load image at " + path);
    });
}