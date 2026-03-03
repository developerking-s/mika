// Discord OAuth Configuration
// Configure these values in your .env file or environment variables
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || encodeURIComponent(window.location.origin + '/callback.html');
const DISCORD_OAUTH_SCOPES = 'identify guilds';

// Generate Discord OAuth URL
function getDiscordOAuthURL() {
    return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${DISCORD_REDIRECT_URI}&response_type=token&scope=${DISCORD_OAUTH_SCOPES}`;
}

// Discord API endpoints
const DISCORD_API_BASE = 'https://discord.com/api/v10';

// Get commands from environment/API
async function fetchCommands() {
    try {
        // Fetch from backend API (which uses environment variables)
        const response = await fetch('/api/commands');
        if (!response.ok) {
            throw new Error('API not available');
        }
        const data = await response.json();
        return data.commands || data;
    } catch (error) {
        // Try local JSON file
        try {
            const response = await fetch('commands.json');
            if (response.ok) {
                const data = await response.json();
                return data.commands;
            }
        } catch (e) {}
        
        // Fallback to embedded commands
        return getEmbeddedCommands();
    }
}

// Embedded commands (fallback when API unavailable)
function getEmbeddedCommands() {
    return [
        { name: 'play', description: 'Toca uma música do YouTube/Spotify', category: 'music', usage: '/play <música>' },
        { name: 'skip', description: 'Pula para próxima música', category: 'music', usage: '/skip' },
        { name: 'queue', description: 'Mostra a fila de músicas', category: 'music', usage: '/queue' },
        { name: 'stop', description: 'Para a música e limpa a fila', category: 'music', usage: '/stop' },
        { name: 'volume', description: 'Ajusta o volume da música', category: 'music', usage: '/volume <1-100>' },
        { name: 'kick', description: 'Expulsa um membro do servidor', category: 'moderation', usage: '/kick <membro> [razão]' },
        { name: 'ban', description: 'Bane um membro do servidor', category: 'moderation', usage: '/ban <membro> [razão]' },
        { name: 'mute', description: 'Silencia um membro', category: 'moderation', usage: '/mute <membro> [tempo]' },
        { name: 'unmute', description: 'Remove o silêncio de um membro', category: 'moderation', usage: '/unmute <membro>' },
        { name: 'clear', description: 'Limpa mensagens do chat', category: 'moderation', usage: '/clear <quantidade>' },
        { name: 'warn', description: 'Adverte um membro', category: 'moderation', usage: '/warn <membro> <razão>' },
        { name: 'balance', description: 'Mostra seu saldo', category: 'economy', usage: '/balance [membro]' },
        { name: 'daily', description: 'Receba seu prêmio diário', category: 'economy', usage: '/daily' },
        { name: 'pay', description: 'Transfere dinheiro para outro usuário', category: 'economy', usage: '/pay <membro> <quantidade>' },
        { name: 'shop', description: 'Abre a loja virtual', category: 'economy', usage: '/shop' },
        { name: 'work', description: 'Trabalhe para ganhar dinheiro', category: 'economy', usage: '/work' },
        { name: 'rob', description: 'Rouba dinheiro de outro usuário', category: 'economy', usage: '/rob <membro>' },
        { name: 'bank', description: 'Gerencia sua conta bancária', category: 'economy', usage: '/bank [depositar|retirar|saldo]' },
        { name: 'meme', description: 'Envia um meme aleatório', category: 'fun', usage: '/meme' },
        { name: 'duelo', description: 'Inicia um duelo com outro usuário', category: 'fun', usage: '/duelo <membro>' },
        { name: 'quiz', description: 'Inicia um quiz', category: 'fun', usage: '/quiz' },
        { name: '8ball', description: 'Pergunte à bola mágica', category: 'fun', usage: '/8ball <pergunta>' },
        { name: 'say', description: 'O bot repete sua mensagem', category: 'fun', usage: '/say <mensagem>' },
        { name: 'avatar', description: 'Mostra o avatar de um usuário', category: 'utility', usage: '/avatar [membro]' },
        { name: 'userinfo', description: 'Mostra informações de um usuário', category: 'utility', usage: '/userinfo [membro]' },
        { name: 'serverinfo', description: 'Mostra informações do servidor', category: 'utility', usage: '/serverinfo' },
        { name: 'ping', description: 'Mostra o ping do bot', category: 'utility', usage: '/ping' },
        { name: 'help', description: 'Mostra lista de comandos', category: 'utility', usage: '/help [comando]' },
        { name: 'setup', description: 'Configura o bot no servidor', category: 'config', usage: '/setup' },
        { name: 'prefix', description: 'Altera o prefixo do bot', category: 'config', usage: '/prefix <novo_prefixo>' },
        { name: 'logs', description: 'Configura os logs do servidor', category: 'config', usage: '/logs <canal>' },
        { name: 'autorole', description: 'Configura cargo automático', category: 'config', usage: '/autorole <cargo>' }
    ];
}

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const userSection = document.getElementById('user-section');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const dashboardBtn = document.getElementById('dashboard-btn');
const logoutBtn = document.getElementById('logout-btn');
const modal = document.getElementById('coming-soon-modal');
const modalClose = document.querySelector('.modal-close');

// Check for saved session
function checkSession() {
    // Check for token in URL hash (OAuth callback)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            // Save token
            localStorage.setItem('mikabot_token', access_token);
            // Clean URL
            window.location.hash = '';
            // Fetch user info
            fetchUserInfo(accessToken);
            return;
        }
    }
    
    // Check for saved token
    const savedToken = localStorage.getItem('mikabot_token');
    if (savedToken) {
        fetchUserInfo(savedToken);
    }
}

// Fetch user info from Discord API
async function fetchUserInfo(token) {
    try {
        const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        const user = await response.json();
        
        // Save user data
        const userData = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`,
            global_name: user.global_name || user.username
        };
        
        localStorage.setItem('mikabot_user', JSON.stringify(userData));
        showUserProfile(userData);
        
    } catch (error) {
        console.error('Error fetching user info:', error);
        // Token might be expired, clear session
        logout();
    }
}

// Show user profile
function showUserProfile(user) {
    userAvatar.src = user.avatar;
    userName.textContent = user.global_name || user.username;
    loginBtn.style.display = 'none';
    userSection.style.display = 'flex';
}

// Hide user profile
function hideUserProfile() {
    loginBtn.style.display = 'flex';
    userSection.style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('mikabot_token');
    localStorage.removeItem('mikabot_user');
    hideUserProfile();
}

// Login handler - Uses real Discord OAuth
loginBtn.addEventListener('click', () => {
    if (!DISCORD_CLIENT_ID || DISCORD_CLIENT_ID === 'YOUR_CLIENT_ID') {
        // Demo mode fallback
        showDemoLogin();
        return;
    }
    
    // Redirect to Discord OAuth
    window.location.href = getDiscordOAuthURL();
});

// Demo login fallback (for testing without OAuth)
function showDemoLogin() {
    const demoUser = {
        id: '123456789012345678',
        username: 'UsuarioDemo',
        discriminator: '0001',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        global_name: 'Usuario Demo (Demo)'
    };
    
    loginBtn.innerHTML = '<span>Entrando...</span>';
    loginBtn.disabled = true;
    
    setTimeout(() => {
        localStorage.setItem('mikabot_user', JSON.stringify(demoUser));
        showUserProfile(demoUser);
        loginBtn.innerHTML = '<img src="https://assets-global.website-files.com/6257adef93867e56f84d3101/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="Discord"> Login com Discord';
        loginBtn.disabled = false;
        alert('Modo Demo: Configure DISCORD_CLIENT_ID no ambiente para usar OAuth real.');
    }, 1000);
}

// Logout handler
logoutBtn.addEventListener('click', logout);

// Dashboard button handler - redirects to dashboard
dashboardBtn.addEventListener('click', () => {
    // Check if user is logged in
    const userData = localStorage.getItem('mikabot_user');
    if (!userData) {
        showComingSoonModal();
        return;
    }
    // In production, redirect to actual dashboard
    window.location.href = '/dashboard.html';
});

// Coming Soon Modal
function showComingSoonModal() {
    modal.classList.add('show');
}

function hideComingSoonModal() {
    modal.classList.remove('show');
}

// Modal close events
modalClose.addEventListener('click', hideComingSoonModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideComingSoonModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideComingSoonModal();
    }
});

// Add click handlers to all "Em Breve" badges and related elements
document.querySelectorAll('.coming-soon-badge').forEach(badge => {
    badge.addEventListener('click', (e) => {
        e.stopPropagation();
        showComingSoonModal();
    });
});

// Add coming soon handlers to dashboard features
document.querySelectorAll('.dash-feature').forEach(feature => {
    feature.addEventListener('click', showComingSoonModal);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(43, 45, 49, 0.98)';
    } else {
        navbar.style.background = 'rgba(43, 45, 49, 0.95)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.command-card, .feature-card, .dash-feature, .full-feature-card').forEach(card => {
    observer.observe(card);
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', checkSession);

// Console message for developers
console.log('%c🚀 MikaBot Website', 'font-size: 20px; font-weight: bold; color: #5865F2;');
console.log('%c--- Configuração ---', 'color: #f2f3f5;');
console.log('%cPara usar OAuth real, configure:', 'color: #b5bac1;');
console.log('%cDISCORD_CLIENT_ID=seu_id', 'font-family: monospace; color: #23a559;');
console.log('%cDISCORD_REDIRECT_URI=sua_url', 'font-family: monospace; color: #23a559;');
console.log('%cEm Breve - Este website está em desenvolvimento.', 'color: #f0b232;');
console.log('%cDesenvolvido com ❤️', 'color: #23a559;');
