// --- INITIALIZATION ---
if (typeof window.tempUsername === 'undefined') {
    window.tempUsername = "";
}

// --- ID FONE TITLE LOGIC ---
function getTitleByLevel(level) {
    if (level >= 2300) return "Legendary";
    if (level >= 2200) return "Celebrity";
    if (level >= 2100) return "Superstar";
    if (level >= 2000) return "Leading Lady";
    if (level >= 1900) return "Famous";
    if (level >= 1800) return "Head Honcho";
    if (level >= 1700) return "Rock Star";
    if (level >= 1600) return "A-Lister";
    if (level >= 1500) return "Diva";
    if (level >= 1400) return "Chart Topper";
    if (level >= 1300) return "Hotshot";
    if (level >= 1200) return "Golden Girl";
    if (level >= 1100) return "Vogue";
    if (level >= 1000) return "VIP";
    if (level >= 900) return "Headliner";
    if (level >= 800) return "Sensei";
    if (level >= 700) return "Mastermind";
    if (level >= 600) return "Guru";
    if (level >= 500) return "Major Leaguer";
    if (level >= 400) return "Scholar";
    if (level >= 300) return "Notable";
    if (level >= 200) return "Explorer";
    if (level >= 100) return "Apprentice";
    if (level >= 15)  return "Rookie";
    return "Novice"; // Levels 1-14
}

// --- UI TOGGLE ---
window.toggleAuth = function(mode) {
    const nameField = document.getElementById('name-field');
    const loginActions = document.getElementById('login-actions');
    const registerActions = document.getElementById('register-actions');
    const titleHeader = document.getElementById('auth-title');

    if (mode === 'register') {
        if (nameField) nameField.style.display = 'block';
        if (registerActions) registerActions.style.display = 'block';
        if (loginActions) loginActions.style.display = 'none';
        if (titleHeader) titleHeader.innerText = "🌸 Join Us";
    } else {
        if (nameField) nameField.style.display = 'none';
        if (registerActions) registerActions.style.display = 'none';
        if (loginActions) loginActions.style.display = 'block';
        if (titleHeader) titleHeader.innerText = "🌸 Login";
    }
};

// --- REGISTER ---
window.register = async function() {
    const name = document.getElementById('userName').value.trim();
    const invite = document.getElementById('inviteCode').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if (!name || !email || !pass) return alert("Fill in the blanks! ✨");
    if (invite !== "AuraAraAprilAya3852") return alert("Invalid invite code! 🔑");
    
    window.tempUsername = name;

    const { error } = await window.supabase.auth.signUp({ email, password: pass });
    
    if (error) return alert(error.message);
    
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
    
    document.getElementById('auth-fields').style.display = 'none'; 
    document.getElementById('char-setup').style.display = 'block'; 
};

// --- LOGIN ---
window.login = async function() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    const { error } = await window.supabase.auth.signInWithPassword({ email, password: pass });

    if (error) alert(error.message);
    else window.location.href = "play.html";
};

// --- CHARACTER SELECTION ---
window.selectGender = function(gender) {
    window.chosenGender = gender;
    document.querySelectorAll('.char-option').forEach(el => el.classList.remove('selected'));
    const selected = document.getElementById(`option-${gender.toLowerCase()}`);
    if (selected) selected.classList.add('selected');
    document.getElementById('enter-btn').style.display = 'inline-block';
};

// --- CONFIRM & SAVE ---
// --- CONFIRM & SAVE (The Fix for Line 130) ---
window.confirmCharacter = async function() {
    if (!window.chosenGender) return alert("Pick a look first!");
    
    // Get the ID of the person who just registered
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
        console.error("Auth Error:", userError);
        return alert("Registration incomplete. Please try again.");
    }

    // This is the part that was hitting the 403 error
    const { error: dbError } = await window.supabase.from('Users').insert([{
        id: user.id,
        username: window.tempUsername || "New Traveler",
        gender: window.chosenGender,
        stars: 1000,
        ecoins: 0,
        gold: 0,
        level: 1,
        title: "Novice"
    }]);

    if (dbError) {
        console.error("Database Error Details:", dbError);
        alert("Database Error: " + dbError.message);
    // Inside your confirmCharacter function, change the success part:
    } else {
    console.log("Profile saved! Entering Prism...");
    // Give the auth session 500ms to sync before switching pages
    setTimeout(() => {
        window.location.href = "play.html";
    }, 500);
    }
};