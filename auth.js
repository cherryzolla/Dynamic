// You get these from your Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://wgxszhetpietfjlgeffp.supabase.co'
const supabaseKey = 'sb_publishable_3NhlyfBqrV1fI3g_-TbMBA_NkXH8JRs'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
// This makes sure your buttons in index.html can "see" these functions

// ... the rest of the functions I gave you before ...
// 3. Attach functions to the window so the HTML buttons can find them
// We do this AT THE TOP to be safe!
window.toggleAuth = (mode) => {
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

window.login = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) alert(error.message);
};

window.register = async () => {
    const name = document.getElementById('userName').value;
    const invite = document.getElementById('inviteCode').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if (invite !== "AuraAraAprilAya3852") return alert("Invalid invite code! 🌸");
    
    const { data, error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return alert(error.message);
    
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    showCharacterCreator();
};

window.selectGender = (gender) => {
    window.chosenGender = gender;
    document.getElementById('option-f').classList.remove('selected');
    document.getElementById('option-m').classList.remove('selected');
    document.getElementById(`option-${gender.toLowerCase()}`).classList.add('selected');
    document.getElementById('enter-btn').style.display = 'inline-block';
};

window.confirmCharacter = async () => {
    if (!window.chosenGender) return;
    const { data: { user } } = await supabase.auth.getUser();
    const usernameInput = document.getElementById('userName').value || "New Traveler";

    const { error } = await supabase.from('users').upsert({
        id: user.id,
        username: usernameInput,
        gender: window.chosenGender,
        stars: 1000,
        level: 1
    });

    if (error) alert(error.message);
    else window.location.href = "play.html";
};

// 4. Watch for Auth State Changes
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        const { data } = await supabase.from('users').select('gender').eq('id', session.user.id).single();
        if (data && data.gender) window.location.href = "play.html";
        else showCharacterCreator();
    }
});

function showCharacterCreator() {
    document.getElementById('auth-fields').style.display = 'none'; 
    document.getElementById('char-setup').style.display = 'block'; 
}