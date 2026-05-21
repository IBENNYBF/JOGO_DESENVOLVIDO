// ==========================================
// TERRARIACRAFT - AUTH v2.0 (Integração PHP)
// Sistema de autenticação via sessões PHP
// ==========================================

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

// ==========================================
// VERIFICAÇÃO DE SESSÃO
// ==========================================

async function checkAuth() {
    try {
        const response = await fetch('./check_session.php', {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (!response.ok) {
            redirectToLogin();
            return false;
        }

        const data = await response.json();
        if (!data.logged_in) {
            redirectToLogin();
            return false;
        }

        // Armazenar dados do usuário em memória (não no localStorage por segurança)
        window.__userData = {
            id: data.user_id,
            name: data.user_name,
            email: data.user_email,
            foto: data.user_foto,
            acesso: data.user_acesso
        };

        return true;

    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
        redirectToLogin();
        return false;
    }
}

function getSession() {
    return window.__userData || null;
}

function getUserName() {
    const session = getSession();
    return session ? session.name : 'default';
}

function redirectToLogin() {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login/')) {
        window.location.href = './login.php';
    }
}

async function logout() {
    try {
        await fetch('./logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        });
    } catch (e) {
        console.error('Erro no logout:', e);
    }

    delete window.__userData;
    window.location.href = './login.php';
}

// Verificar sessão periodicamente
setInterval(async () => {
    if (window.location.pathname.includes('/jogo/')) {
        const isAuth = await checkAuth();
        if (!isAuth) {
            alert('Sua sessão expirou. Faça login novamente.');
        }
    }
}, SESSION_CHECK_INTERVAL);

// Mostrar/ocultar senha
function togglePassword(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;

    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
        toggle.setAttribute('aria-label', 'Ocultar senha');
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
        toggle.setAttribute('aria-label', 'Mostrar senha');
    }
}
