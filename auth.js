// You get these from your Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://wgxszhetpietfjlgeffp.supabase.co'
const supabaseKey = 'sb_publishable_3NhlyfBqrV1fI3g_-TbMBA_NkXH8JRs'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
// This makes sure your buttons in index.html can "see" these functions
window.login = login;
window.register = register;
window.toggleAuth = toggleAuth;
window.confirmCharacter = confirmCharacter;
window.selectGender = selectGender;

// ... the rest of the functions I gave you before ...
let chosenGender = null;

// 2. Check Auth State (Replaces auth.onAuthStateChanged)
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        const user = session.user;
        // Check if user has a profile in our 'users' table
        const { data, error } = await supabase
            .from('users')
            .select('gender')
            .eq('id', user.id)
            .single();

        if (data && data.gender) {
            // Already has a character!
            window.location.href = "play.html";
        } else {
            // New user, show creator
            showCharacterCreator();
        }
    } else {
        document.getElementById('auth-page').style.display = 'block';
    }
});

// 3. Register Function
async function register() {
    const name = document.getElementById('userName').value;
    const invite = document.getElementById('inviteCode').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if (invite !== "AuraAraAprilAya3852") return alert("Sorry! Invalid invite code. 🌸");
    if (!name || !email || !pass) return alert("Fill everything out! ✨");

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: pass
    });

    if (error) return alert(error.message);
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    showCharacterCreator();
}

// 4. Login Function
async function login() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass
    });

    if (error) alert(error.message);
}

// 5. Save Character (Replaces db.collection.set)
async function confirmCharacter() {
    if (!chosenGender) return;

    const { data: { user } } = await supabase.auth.getUser();
    const usernameInput = document.getElementById('userName').value || "New Traveler";

    const starterData = {
        id: user.id, // Very important for Supabase!
        username: usernameInput,
        gender: chosenGender,
        stars: 1000,
        level: 1,
        currentOutfit: {
            body: chosenGender === 'F' ? 'body_f' : 'body_m',
            hair: 'none',
            tops: 'none'
        }
    };

    const { error } = await supabase
        .from('users')
        .upsert(starterData); // Upsert handles both "create" and "update"

    if (error) {
        alert("Error saving: " + error.message);
    } else {
        window.location.href = "play.html";
    }
}

// 6. Logout
async function logout() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

// --- UI Functions (These stay exactly the same!) ---

function selectGender(gender) {
    chosenGender = gender;
    document.getElementById('option-f').classList.remove('selected');
    document.getElementById('option-m').classList.remove('selected');
    document.getElementById(`option-${gender.toLowerCase()}`).classList.add('selected');
    document.getElementById('enter-btn').style.display = 'inline-block';
}

function showCharacterCreator() {
    document.getElementById('auth-fields').style.display = 'none'; 
    document.getElementById('char-setup').style.display = 'block'; 
}

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