// Supabase Configuration
const SUPABASE_URL = 'https://vbieajevljjwqfgdtfhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaWVhamV2bGpqd3FmZ2R0ZmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTgwNjksImV4cCI6MjA4MTE5NDA2OX0.coBrXxDf8JzrEj7MlrTxJkhoSdKMH10f9nDm9U1Ctxg';

// Initialize Supabase client
let supabase = null;

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 이메일에서 아이디만 추출
 * @param {string} email - 이메일 주소
 * @returns {string} - '@' 앞부분 아이디
 */
function extractUserId(email) {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
}

// Supabase 초기화 함수
function initSupabase() {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase library not loaded. Make sure the CDN script is included.');
            return false;
        }
        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('Supabase initialized successfully');
            console.log('Supabase client:', supabase);
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return false;
        }
    } else {
        console.warn('Supabase credentials not configured. Using mock mode.');
        return false;
    }
}

// Check if user is logged in
async function checkAuth() {
    // Supabase 세션 확인
    if (supabase) {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                localStorage.removeItem('user');
                return null;
            }

            if (session) {
                // 세션 존재 - 사용자 정보 반환
                console.log('Session found:', session.user.email);
                const user = {
                    id: session.user.id,
                    email: session.user.email,
                    created_at: session.user.created_at
                };
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            } else {
                // 세션 없음 - 로컬 스토리지 정리
                console.log('No session found');
                localStorage.removeItem('user');
                return null;
            }
        } catch (error) {
            console.error('checkAuth error:', error);
            return null;
        }
    } else {
        // Mock mode
        console.log('Running in mock mode');
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

// 동기 버전 (호환성)
function checkAuthSync() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Update UI based on auth state
async function updateAuthUI() {
    console.log('updateAuthUI called');
    const user = await checkAuth();

    const authLinkLogin = document.getElementById('auth-link-login');
    const authUser = document.getElementById('auth-user');
    const userEmail = document.getElementById('user-email');

    console.log('Auth elements:', {
        authLinkLogin: !!authLinkLogin,
        authUser: !!authUser,
        userEmail: !!userEmail
    });

    if (user) {
        // 로그인 상태
        console.log('User logged in:', user.email);
        if (authLinkLogin) authLinkLogin.style.display = 'none';
        if (authUser) authUser.style.display = 'flex';
        if (userEmail) {
            // 이메일에서 아이디만 추출하여 표시
            userEmail.textContent = extractUserId(user.email);
        }
    } else {
        // 비로그인 상태
        console.log('User not logged in');
        if (authLinkLogin) authLinkLogin.style.display = 'flex';
        if (authUser) authUser.style.display = 'none';
    }
}

// Login function
async function login(email, password, rememberMe = true) {
    try {
        // Supabase가 설정되어 있으면 실제 로그인
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Login error:', error);

                // 에러 메시지 한글화
                let errorMessage = '로그인 실패';
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
                } else {
                    errorMessage = '로그인 실패: ' + error.message;
                }

                showMessage(errorMessage, 'error');
                return { success: false, error };
            }

            console.log('Login successful:', data);

            // 자동 로그인 유지 설정
            if (!rememberMe) {
                // 자동 로그인 미선택: 세션 스토리지 사용
                // Supabase는 기본적으로 localStorage 사용하므로,
                // 브라우저 닫을 때 세션 삭제를 위해 플래그 저장
                sessionStorage.setItem('session_only', 'true');
            } else {
                // 자동 로그인 선택: localStorage 사용 (기본값)
                sessionStorage.removeItem('session_only');
            }

            // 사용자 정보 저장 (호환성을 위해)
            const user = {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at
            };
            localStorage.setItem('user', JSON.stringify(user));

            showMessage('로그인 성공!', 'success');

            setTimeout(() => {
                window.location.href = 'board.html';
            }, 1000);

            return { success: true, data };
        } else {
            // Mock mode - Supabase 미설정 시
            console.log('Mock login attempt:', email);

            const mockUser = {
                id: '1',
                email: email,
                created_at: new Date().toISOString()
            };

            localStorage.setItem('user', JSON.stringify(mockUser));
            showMessage('로그인 성공! (Mock Mode)', 'success');

            setTimeout(() => {
                window.location.href = 'board.html';
            }, 1000);

            return { success: true };
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('로그인 실패: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Signup function
async function signup(email, password) {
    try {
        // Supabase가 설정되어 있으면 실제 회원가입
        if (supabase) {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin + '/login.html'
                }
            });

            if (error) {
                console.error('Signup error:', error);
                showMessage('회원가입 실패: ' + error.message, 'error');
                return { success: false, error };
            }

            console.log('Signup successful:', data);
            showMessage('회원가입 성공! 이메일을 확인해주세요.', 'success');

            // 1.5초 후 로그인 폼으로 전환
            setTimeout(() => {
                showLoginForm();
            }, 1500);

            return { success: true, data };
        } else {
            // Mock mode - Supabase 미설정 시
            console.log('Mock signup attempt:', email);
            showMessage('회원가입 성공! 로그인해주세요. (Mock Mode)', 'success');

            setTimeout(() => {
                showLoginForm();
            }, 1500);

            return { success: true };
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('회원가입 실패: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Logout function
async function logout(e) {
    if (e) e.preventDefault();

    try {
        // Supabase가 설정되어 있으면 실제 로그아웃
        if (supabase) {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Logout error:', error);
                showMessage('로그아웃 실패: ' + error.message, 'error');
                return;
            }

            console.log('Logout successful');
        }

        // 로컬 스토리지 정리
        localStorage.removeItem('user');
        sessionStorage.removeItem('session_only');

        showMessage('로그아웃되었습니다.', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('로그아웃 실패: ' + error.message, 'error');
    }
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
    const resetForm = document.getElementById('reset-password-form-container');

    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (resetForm) resetForm.style.display = 'none';
}

// Show signup form
function showSignupForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');
    const resetForm = document.getElementById('reset-password-form-container');

    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (resetForm) resetForm.style.display = 'none';
}

// Show reset password form
function showResetPasswordForm() {
    const loginForm = document.getElementById('login-form-container');
    const signupForm = document.getElementById('signup-form-container');
    const resetForm = document.getElementById('reset-password-form-container');

    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (resetForm) resetForm.style.display = 'block';
}

// Reset password function
async function resetPassword(email) {
    try {
        // Supabase가 설정되어 있으면 실제 비밀번호 재설정
        if (supabase) {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });

            if (error) {
                console.error('Reset password error:', error);
                showMessage('비밀번호 재설정 실패: ' + error.message, 'error');
                return { success: false, error };
            }

            console.log('Reset password email sent:', data);
            showMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.', 'success');

            // 1.5초 후 로그인 폼으로 전환
            setTimeout(() => {
                showLoginForm();
            }, 2000);

            return { success: true, data };
        } else {
            // Mock mode
            console.log('Mock reset password attempt:', email);
            showMessage('비밀번호 재설정 링크가 전송되었습니다. (Mock Mode)', 'success');

            setTimeout(() => {
                showLoginForm();
            }, 2000);

            return { success: true };
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showMessage('비밀번호 재설정 실패: ' + error.message, 'error');
        return { success: false, error };
    }
}

// Initialize auth page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    initSupabase();

    // Update auth UI
    updateAuthUI();

    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            await login(email, password, rememberMe);
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

    // Reset password form handler
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('reset-email').value;
            await resetPassword(email);
        });
    }

    // Show reset password form button
    const showResetPasswordBtn = document.getElementById('show-reset-password');
    if (showResetPasswordBtn) {
        showResetPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showResetPasswordForm();
        });
    }

    // Back to login button
    const backToLoginBtn = document.getElementById('back-to-login');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
});
