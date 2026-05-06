const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('baileys')
const pino = require('pino')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('==== SCAN HII QR MKUU - UNA 60 SECONDS ====')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Connection closed, reconnecting:', shouldReconnect)
            if (shouldReconnect) startBot()
        }

        if (connection === 'open') {
            console.log('✅ KANDALA-BOT IMEUNGWA WHATSAPP')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return

        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || ''

        if (body.toLowerCase() === 'menu' || body === '.menu') {
            const menuText = `╭───❰ *KANDALA TECH* ❱───
│
│ 🔥 *200+ FEATURES*
│
│ *DOWNLOADER*
│ •.play - Download song
│ •.video - Download video
│ •.tiktok - TikTok
│
│ *AI & CHAT*
│ •.ai - ChatGPT
│ •.img - Generate image
│
│ *GROUP*
│ •.kick - Toa mtu
│ •.tagall - Tag wote
│
│ *CONVERTER*
│ •.sticker - Picha to sticker
│
│ *Owner: 255672752355*
╰───────────────`
            await sock.sendMessage(from, { text: menuText })
        }
    })
} // <-- HII BRACE ULIKUWA UMESAHAU

startBot() // <-- NA HII ULIKUWA UMESAHAU
