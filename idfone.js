// idfone.js
async function openIdFone(userId) {
    // It will find the 'db' we attached to the window in core.js
    const userRef = window.db.collection("users").doc(userId);
    const snap = await userRef.get();

    if (snap.exists) {
        const data = snap.data();
        // ... fill your idfone UI ...
    }
}
async function showIdFone(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        const data = snap.data();
        const overlay = document.getElementById("id-fone-overlay");
        
        // Fill the HTML template with Firebase data
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