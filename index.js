// index.js

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const axios = require('axios');

// La URL del webhook la tomamos desde la variable de entorno configurada en Railway
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const audioMsg = msg.message.audioMessage;

        const data = {
            from: msg.key.remoteJid,
            type: audioMsg ? 'audio' : 'text',
            text: textMsg || null,
            audio: audioMsg ? audioMsg.url : null,
            timestamp: msg.messageTimestamp
        };

        try {
            await axios.post(N8N_WEBHOOK_URL, data);
            console.log('Reporte enviado a N8N:', data);
        } catch (err) {
            console.error('Error enviando a N8N:', err.message);
        }
    });
}

startBot();
