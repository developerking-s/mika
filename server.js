require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot commands loaded from environment variables (or use defaults)
// These can be set in .env or environment
const COMMANDS = process.env.BOT_COMMANDS ? JSON.parse(process.env.BOT_COMMANDS) : [
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

// Bot configuration from environment
const BOT_CONFIG = {
    name: process.env.BOT_NAME || 'MikaBot',
    clientId: process.env.DISCORD_CLIENT_ID || '',
    description: process.env.BOT_DESCRIPTION || 'O melhor bot para seu servidor do Discord',
    color: process.env.BOT_COLOR || '#5865F2'
};

// Serve static files
app.use(express.static(path.join(__dirname)));

// API endpoint to get commands (fetches from environment)
app.get('/api/commands', (req, res) => {
    res.json({
        commands: COMMANDS,
        source: 'environment',
        bot: BOT_CONFIG.name
    });
});

// API endpoint to get bot info
app.get('/api/bot', (req, res) => {
    res.json(BOT_CONFIG);
});

// API endpoint for economy data
app.get('/api/economy', (req, res) => {
    const economyCommands = COMMANDS.filter(cmd => cmd.category === 'economy');
    res.json({
        commands: economyCommands,
        features: [
            { name: 'Saldo virtual', description: 'Cada usuário tem seu próprio saldo' },
            { name: 'Trabalho', description: 'Trabalhe para ganhar dinheiro diário' },
            { name: 'Loja', description: 'Compre itens e upgrades' },
            { name: 'Banco', description: 'Deposite e retire dinheiro' },
            { name: 'Roubo', description: 'Roube de outros usuários (com risco)' }
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 MikaBot Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Servidor rodando em: http://localhost:${PORT}
📋 Comandos carregados do ambiente: ${COMMANDS.length}
🤖 Bot: ${BOT_CONFIG.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});
