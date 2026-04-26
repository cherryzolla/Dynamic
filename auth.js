// auth.js

// 1. Setup (REPLACE WITH YOUR ACTUAL DATA)
const supabaseUrl = 'https://wgxszhetpietfjlgeffp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneHN6aGV0cGlldGZqbGdlZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxODUxOTYsImV4cCI6MjA5Mjc2MTE5Nn0.WPfXK-5qPgvnZP2H_eyC55EXpfAf8C7rGLsDwv86Oz0';

// 2. Create the connection
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 3. EXPOSE FUNCTIONS TO HTML BUTTONS
// This is the most important part!
window.login = async function() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass
    });

    if (error) alert(error.message);
};

window.register = async function() {
    const name = document.getElementById('userName').value;
    const invite = document.getElementById('inviteCode').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if (invite !== "AuraAraAprilAya3852") return alert("Invalid invite code! 🌸");
    
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return alert(error.message);
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    showCharacterCreator();
};

window.toggleAuth = function(mode) {
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
};

window.selectGender = function(gender) {
    window.chosenGender = gender;
    document.getElementById('option-f').classList.remove('selected');
    document.getElementById('option-m').classList.remove('selected');
    document.getElementById(`option-${gender.toLowerCase()}`).classList.add('selected');
    document.getElementById('enter-btn').style.display = 'inline-block';
};

window.confirmCharacter = async function() {
    if (!window.chosenGender) return;
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('users').upsert({
        id: user.id,
        username: document.getElementById('userName').value || "New Traveler",
        gender: window.chosenGender,
        stars: 1000,
        level: 1
    });

    if (error) alert(error.message);
    else window.location.href = "play.html";
};

function showCharacterCreator() {
    document.getElementById('auth-fields').style.display = 'none'; 
    document.getElementById('char-setup').style.display = 'block'; 
}

// 4. Watch for Login
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        console.log("User is logged in!");
    }
});