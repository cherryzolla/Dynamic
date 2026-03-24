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
// ... (Your Firebase Config stays here at the top) ...

async function confirmCharacter() {
    if (!chosenGender) return;
    
    const user = auth.currentUser;
    // Get the name from the input field
    const nameInput = document.getElementById('userName').value || "User";

    const starterData = {
        username: nameInput,
        gender: chosenGender,
        stars: 1000,
        level: 1,
        currentOutfit: {
            // These IDs now match the keys in assets.js!
            body: chosenGender === 'F' ? 'body_f' : 'body_m',
            hair: 'none',
            tops: 'none'
        }
    };

    try {
        await db.collection("users").doc(user.uid).set(starterData);
        window.location.href = "play.html";
    } catch (e) {
        alert("Error saving: " + e.message);
    }
}

// ... (Rest of your login/register functions) ...
// --- AUTH OBSERVER ---
// This watches if someone logs in and decides where to send them
auth.onAuthStateChanged((user) => {
    if (user) {
        // Check if this user already picked a gender
        db.collection("users").doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().gender) {
                // If they have a character, send them to the game!
                window.location.href = "play.html"; 
            } else {
                // If they are new, show the Character Picker
                showCharacterCreator();
            }
        });
    } else {
        // If logged out, show the login page
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
    // Hide the email/password fields
    document.getElementById('auth-fields').style.display = 'none'; 
    // Show the Boy/Girl selection cards
    document.getElementById('char-setup').style.display = 'block'; 
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
            // Instead of enterApp(), we show the Character Creator
            showCharacterCreator(); 
        })
        .catch(err => alert(err.message));
}

function login() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    
    auth.signInWithEmailAndPassword(email, pass)
        .catch(err => alert(err.message));
    // Note: The Auth Observer at the top handles the redirect to play.html automatically!
}

function logout() {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    });
}

// --- CHARACTER SELECTION LOGIC ---
let chosenGender = null;

function selectGender(gender) {
    chosenGender = gender;
    
    // Highlight the selection
    document.getElementById('option-f').classList.remove('selected');
    document.getElementById('option-m').classList.remove('selected');
    document.getElementById(`option-${gender.toLowerCase()}`).classList.add('selected');
    
    // Show the "Confirm" button
    document.getElementById('enter-btn').style.display = 'inline-block';
}

async function confirmCharacter() {
    if (!chosenGender) return;
    
    const user = auth.currentUser;
    const username = document.getElementById('userName').value || "New Traveler";

    // Save their base identity to Firestore
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

    // Take them to the world!
    window.location.href = "play.html";
}