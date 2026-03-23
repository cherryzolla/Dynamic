
function enterApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    loadUserData();
    loadDumps(); // Pulls your thoughts from the cloud
}

function show(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function loadUserData() {
    const user = auth.currentUser;
    if (user) {
        db.collection("users").doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                document.getElementById('welcome-msg').innerText = `Keep killing it, ${doc.data().displayName}! ✨`;
            }
        });
    }
}

// --- THE DUMP LOGIC ---
function addDump() {
    const text = document.getElementById('dumpIn').value;
    const user = auth.currentUser;
    if (!text) return alert("Type something first! 🌪️");

    db.collection("users").doc(user.uid).collection("dumps").add({
        content: text,
        timestamp: new Date()
    }).then(() => {
        document.getElementById('dumpIn').value = "";
        loadDumps();
    });
}

function loadDumps() {
    const user = auth.currentUser;
    const dumpList = document.getElementById('dump-list');
    
    db.collection("users").doc(user.uid).collection("dumps")
      .orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
          dumpList.innerHTML = "";
          snapshot.forEach((doc) => {
              const data = doc.data();
              dumpList.innerHTML += `
                <div class="card" style="font-size: 14px; border-left: 5px solid #ff8fb1; margin-bottom: 10px;">
                    ${data.content}
                </div>`;
          });
      });
}