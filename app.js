
const firebaseConfig = {
  apiKey: "AIzaSyAXvloQVCgdaqHJSUMW9EjoMR6loLsDKpQ",
  authDomain: "dynamic-40949.firebaseapp.com",
  projectId: "dynamic-40949",
  storageBucket: "dynamic-40949.firebasestorage.app",
  messagingSenderId: "377647789786",
  appId: "1:377647789786:web:0c9b5fbdd0880f36b297e3",
  measurementId: "G-9KWEJYE88T"
};


const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

function register() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if(!name || !email || !pass) return alert("Please fill out everything! ✨");

    auth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            // Save the user's name to Firestore
            return db.collection("users").doc(userCredential.user.uid).set({
                displayName: name,
                created: new Date()
            });
        })
        .then(() => enterApp())
        .catch(err => alert(err.message));
}


function login() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => enterApp())
        .catch(err => alert(err.message));
}


function enterApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    loadUserData();
}


function loadUserData() {
    const user = auth.currentUser;
    if (user) {
        db.collection("users").doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const name = doc.data().displayName;
                document.getElementById('welcome-msg').innerText = `Welcome back, ${name}! 🌸`;
            }
        });
    }
}


function logout() {
    auth.signOut().then(() => {
        location.reload(); // Refresh to go back to login screen
    });
}


function show(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}