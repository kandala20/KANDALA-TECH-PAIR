const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys')
const pino = require('pino')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>𝗞𝗔𝗡𝗗𝗔𝗟𝗔 𝗧𝗘𝗖𝗛® Pair</title></head>
      <body style="background:#0d1117;color:#fff;font-family:sans-serif;text-align:center;padding-top:50px">
        <h1>𝗞𝗔𝗡𝗗𝗔𝗟𝗔 𝗧𝗘𝗖𝗛® Pair Code</h1>
        <form action="/pair" method="post">
          <input name="number" placeholder="255712345678" style="padding:10px;width:250px" required>
          <button style="padding:10px;background:#00ff88;border:none;cursor:pointer">Get Code</button>
        </form>
      </body>
    </html>
  `)
})

app.post('/pair', async (req, res) => {
  let num = req.body.number.replace(/[^0-9]/g, '')
  if (!num) return res.send('Weka namba sahihi')
  
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Desktop')
  })
  
  sock.ev.on('creds.update', saveCreds)
  
  if (!sock.authState.creds.registered) {
    try {
      await delay(1500)
      let code = await sock.requestPairingCode(num)
      res.send(`<body style="background:#0d1117;color:#fff;text-align:center;padding-top:50px;font-family:sans-serif"><h1 style="color:#00ff88">Your Pair Code: ${code}</h1><p>Fungua WhatsApp > Linked Devices > Link with phone number</p><a href="/" style="color:#00ff88">Back</a></body>`)
    } catch (e) {
      res.send(`<body style="background:#0d1117;color:#fff;text-align:center;padding-top:50px"><h2 style="color:red">Error: ${e.message}</h2><a href="/" style="color:#00ff88">Try Again</a></body>`)
    }
  } else {
    res.send('<body style="background:#0d1117;color:#fff;text-align:center;padding-top:50px"><h2>Already paired</h2><a href="/" style="color:#00ff88">Back</a></body>')
  }
})

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

app.listen(port, () => console.log(`𝗞𝗔𝗡𝗗𝗔𝗟𝗔 𝗧𝗘𝗖𝗛® running on ${port}`))
