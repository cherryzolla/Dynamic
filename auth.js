// --- CONFIG & INIT ---
const firebaseConfig = {
  apiKey: "AIzaSyAXvloQVCgdaqHJSUMW9EjoMR6loLsDKpQ",
  authDomain: "dynamic-40949.firebaseapp.com",
  projectId: "dynamic-40949",
  storageBucket: "dynamic-40949.firebasestorage.app",
  messagingSenderId: "377647789786",
  appId: "1:377647789786:web:0c9b5fbdd0880f36b297e3",
  measurementId: "G-9KWEJYE88T"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- AUTH OBSERVER ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // Check if user already has a gender/character set up
        db.collection("users").doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().gender) {
                window.location.href = "play.html"; // Already has a character? Go to game.
            } else {
                showCharacterCreator(); // New user? Show the picker.
            }
        });
    } else {
        document.getElementById('auth-page').style.display = 'block';
    }
});

// --- UI HELPERS ---
function toggleAuth(mode) {
    const nameField = document.getElementById('name-field');
    const loginActions = document.getElementById('login-actions');
    const registerActions = document.getElementById('register-actions');
    const title = document.getElementById('auth-title');

    if (mode === 'register') {
        nameField.style.display = 'block';
        registerActions.style.display = 'block';
        loginActions.style.display = 'none';
        title.innerText = "🌸 Join Us";
    } else {
        nameField.style.display = 'none';
        registerActions.style.display = 'none';
        loginActions.style.display = 'block';
        title.innerText = "🌸 Login";
    }
}

function showCharacterCreator() {
    document.getElementById('auth-fields').style.display = 'none'; // Hide login/register
    document.getElementById('char-setup').style.display = 'block'; // Show Boy/Girl picker
}

// --- REGISTER & LOGIN ---
function register() {
    const name = document.getElementById('userName').value;
    const invite = document.getElementById('inviteCode').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if(invite !== "AuraAraAprilAya3852") return alert("Sorry! Invalid invite code. 🌸");
    if(!name || !email || !pass) return alert("Fill everything out! ✨");

    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            showCharacterCreator(); // Immediately show character creator after register
        })
        .catch(err => alert(err.message));
}

function login() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    auth.signInWithEmailAndPassword(email, pass)
        .catch(err => alert(err.message));
    // Observer handles redirection to play.html
}

function logout() {
    auth.signOut().then(() => window.location.href = "index.html");
}

// --- CHARACTER SELECTION ---
let chosenGender = null;

function selectGender(gender) {
    chosenGender = gender;
    document.getElementById('option-f').classList.remove('selected');
    document.getElementById('option-m').classList.remove('selected');
    document.getElementById(`option-${gender.toLowerCase()}`).classList.add('selected');
    document.getElementById('enter-btn').style.display = 'inline-block';
}

async function confirmCharacter() {
    if (!chosenGender) return;
    const user = auth.currentUser;
    const username = document.getElementById('userName').value || "Traveler";

    await db.collection("users").doc(user.uid).set({
        username: username,
        gender: chosenGender,
        stars: 1000,
        level: 1,
        currentOutfit: {
            body: chosenGender === 'F' ? 'body_f' : 'body_m',
            hair: 'none',
            tops: 'none'
        }
    });

    window.location.href = "play.html";
}