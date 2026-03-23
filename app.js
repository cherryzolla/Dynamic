// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXvloQVCgdaqHJSUMW9EjoMR6loLsDKpQ",
  authDomain: "dynamic-40949.firebaseapp.com",
  projectId: "dynamic-40949",
  storageBucket: "dynamic-40949.firebasestorage.app",
  messagingSenderId: "377647789786",
  appId: "1:377647789786:web:0c9b5fbdd0880f36b297e3",
  measurementId: "G-9KWEJYE88T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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