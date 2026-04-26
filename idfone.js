// idfone.js
async function openIdFone(userId) {
    // 1. Find the overlay
    const overlay = document.getElementById('idfone-overlay');
    overlay.style.display = 'block';
    if (!overlay) {
        console.error("ID Fone HTML not loaded yet!");
        return;
    }

    // 2. Fetch from Firebase
    const userRef = window.db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (snap.exists) {
        const data = snap.data();

        // 3. Update the UI with Firebase data
        document.getElementById('idfone-username').innerText = data.username || "Unknown";
        document.getElementById('idfone-stars').innerText = data.stars || 0;
        document.getElementById('idfone-ecoins').innerText = data.ecoins || 0;
        document.getElementById('idfone-gold').innerText = data.gold || 0;
        document.getElementById('idfone-level').innerText = data.level || 0;
        document.getElementById('idfone-mood').innerText = data.mood || "Happy";

        // 4. Finally, SHOW the phone
        overlay.style.display = 'block'; 
        // Or if you use the id-fone-overlay wrapper:
        document.getElementById('id-fone-overlay').style.display = 'block';
    }
}
async function showIdFone(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        const data = snap.data();
        const overlay = document.getElementById("id-fone-overlay");
        overlay.innerHTML = `
            <div class="idfone-shell">
                <div class="idfone-screen">
                    <div class="header">
                        <span class="username">${data.username}</span>
                        <span class="lvl">Lv. ${data.level || 1}</span>
                    </div>
                    <div class="stats-area">
                        <p>Stars: ${data.stars || 0}</p>
                        <p class="bio">${data.bio || "No bio set."}</p>
                    </div>
                    <button onclick="document.getElementById('id-fone-overlay').style.display='none'">Close</button>
                </div>
            </div>
        `;
        overlay.style.display = "flex";
    }
}