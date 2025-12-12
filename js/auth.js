// Supabase Configuration
// TODO: Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client (when Supabase is integrated)
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Update UI based on auth state
function updateAuthUI() {
    const user = checkAuth();
    const authBtn = document.getElementById('auth-btn');

    if (authBtn) {
        if (user) {
            authBtn.textContent = '로그아웃';
            authBtn.href = '#';
            authBtn.onclick = logout;
        } else {
            authBtn.textContent = '로그인';
            authBtn.href = 'login.html';
            authBtn.onclick = null;
        }
    }
}

// Login function
async function login(email, password) {
    try {
        // TODO: Replace with actual Supabase authentication
        // const { data, error } = await supabase.auth.signInWithPassword({
        //     email: email,
        //     password: password
        // });

        // Mock login for wireframe
        console.log('Login attempt:', email);

        // Simulate successful login
        const mockUser = {
            id: '1',
            email: email,
            created_at: new Date().toISOString()
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        showMessage('로그인 성공!', 'success');

        setTimeout(() => {
            window.location.href = 'community.html';
        }, 1000);

        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        showMessage('로그인 실패: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Signup function
async function signup(email, password) {
    try {
        // TODO: Replace with actual Supabase authentication
        // const { data, error } = await supabase.auth.signUp({
        //     email: email,
        //     password: password
        // });

        // Mock signup for wireframe
        console.log('Signup attempt:', email);

        // Simulate successful signup
        showMessage('회원가입 성공! 로그인해주세요.', 'success');

        setTimeout(() => {
            showLoginForm();
        }, 1500);

        return { success: true };
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('회원가입 실패: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Logout function
function logout(e) {
    if (e) e.preventDefault();

    // TODO: Replace with actual Supabase logout
    // await supabase.auth.signOut();

    localStorage.removeItem('user');
    showMessage('로그아웃되었습니다.', 'success');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Show message
function showMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = 'auth-message show ' + type;

        setTimeout(() => {
            messageEl.className = 'auth-message';
        }, 5000);
    }
}

// Show login form
function showLoginForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');

    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
}

// Show signup form
function showSignupForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');

    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
}

// Initialize auth page
document.addEventListener('DOMContentLoaded', function() {
    // Update auth UI
    updateAuthUI();

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            await login(email, password);
        });
    }

    // Signup form handler
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const passwordConfirm = document.getElementById('signup-password-confirm').value;

            if (password !== passwordConfirm) {
                showMessage('비밀번호가 일치하지 않습니다.', 'error');
                return;
            }

            await signup(email, password);
        });
    }

    // Form toggle handlers
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');

    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
});
