
function enterApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    loadUserData();
    loadDumps(); 
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

let thoughts = []; 

function addDump() {
    const text = document.getElementById('dumpIn').value;
    const user = auth.currentUser;
    if (!text) return alert("Your mind isn't empty, type something! 🌸");

    db.collection("users").doc(user.uid).collection("dumps").add({
        content: text,
        timestamp: new Date(),
        // Give it a random spot on the canvas so they aren't all on top of each other
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50
    }).then(() => {
        document.getElementById('dumpIn').value = "";
        confetti({ particleCount: 50, colors: ['#ffb7c5'] });
        loadDumps();
    });
}

function loadDumps() {
    const canvas = document.getElementById('dumpCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('canvas-container');

    // Make it fit the phone screen perfectly
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const user = auth.currentUser;
    db.collection("users").doc(user.uid).collection("dumps")
      .orderBy("timestamp", "desc").limit(20)
      .onSnapshot((snapshot) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          snapshot.forEach((doc) => {
              const d = doc.data();
              // Use saved coordinates or random ones if new
              const x = d.x || Math.random() * (canvas.width - 100) + 20;
              const y = d.y || Math.random() * (canvas.height - 50) + 40;
              drawThought(ctx, d.content, x, y);
          });
      });
}

function drawThought(ctx, text, x, y) {
    ctx.font = "700 14px 'Quicksand'";
    const tw = ctx.measureText(text).width;
    
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#2d2d2d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 25, tw + 20, 35, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2d2d2d";
    ctx.fillText(text, x, y);
}