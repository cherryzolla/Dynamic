const firebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function register() {
    const e = document.getElementById('email').value;
    const p = document.getElementById('pass').value;
    firebase.auth().createUserWithEmailAndPassword(e, p)
        .then(() => enterApp())
        .catch(err => alert(err.message));
}

function login() {
    const e = document.getElementById('email').value;
    const p = document.getElementById('pass').value;
    firebase.auth().signInWithEmailAndPassword(e, p)
        .then(() => enterApp())
        .catch(err => alert(err.message));
}

function logout() {
    firebase.auth().signOut().then(() => location.reload());
}

function enterApp() {
    document.getElementById('auth-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    loadData();
}

function show(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function addTodo() {
    const user = firebase.auth().currentUser;
    const val = document.getElementById('todoIn').value;
    if(user && val) {
        db.collection("users").doc(user.uid).collection("todos").add({
            text: val, time: Date.now()
        }).then(() => document.getElementById('todoIn').value = "");
    }
}

function loadData() {
    const user = firebase.auth().currentUser;
    db.collection("users").doc(user.uid).collection("todos").orderBy("time", "desc")
        .onSnapshot(snap => {
            let h = "";
            snap.forEach(doc => {
                h += `<div class="item"><span>${doc.data().text}</span><button onclick="delTodo('${doc.id}')" style="border:none; background:none;">🌸</button></div>`;
            });
            document.getElementById('todo-list').innerHTML = h;
        });
}

function delTodo(id) {
    const user = firebase.auth().currentUser;
    confetti({ particleCount: 40 });
    db.collection("users").doc(user.uid).collection("todos").doc(id).delete();
}