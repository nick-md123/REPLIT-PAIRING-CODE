//copy code? pls put my github name as credit
//🖕 to those who copy without credit
const makeWASocket = require("@whiskeysockets/baileys").default
const qrcode = require("qrcode-terminal")
const fs = require('fs')
const pino = require('pino')
const { delay, useMultiFileAuthState, BufferJSON, fetchLatestBaileysVersion, PHONENUMBER_MCC, DisconnectReason, makeInMemoryStore, jidNormalizedUser, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const Pino = require("pino")
const NodeCache = require("node-cache")
const chalk = require("chalk")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")


let phoneNumber = "2348109263390"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))


  async function qr() {
//------------------------------------------------------
let { version, isLatest } = await fetchLatestBaileysVersion()
const {  state, saveCreds } =await useMultiFileAuthState(`./sessions`)
    const msgRetryCounterCache = new NodeCache() // for retry message, "waiting message"
    const EliteProEmpire = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
      mobile: useMobile, // mobile api (prone to bans)
      browser: ['Chrome (Linux)', '', ''], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
     auth: {
         creds: state.creds,
         keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
      },
      browser: ['Chrome (Linux)', '', ''], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
      markOnlineOnConnect: true, // set false for offline
      generateHighQualityLinkPreview: true, // make high preview link
      getMessage: async (key) => {
         let jid = jidNormalizedUser(key.remoteJid)
         let msg = await store.loadMessage(jid, key.id)

         return msg?.message || ""
      },
      msgRetryCounterCache, // Resolve waiting messages
      defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
   })


    // login use pairing code
   // source code https://github.com/WhiskeySockets/Baileys/blob/master/Example/example.ts#L61
   if (pairingCode && !EliteProEmpire.authState.creds.registered) {
      if (useMobile) throw new Error('Cannot use pairing code with mobile api')

      let phoneNumber
      if (!!phoneNumber) {
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2348109263390")))
            process.exit(0)
         }
      } else {
         phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 🏌️\nFor example: +2348109263390 : `)))
         phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

         // Ask again when entering the wrong number
         if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.bgBlack(chalk.redBright("Start with country code of your WhatsApp Number, Example : +2348109263390")))

            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😎\nFor example: +2348109263390 : `)))
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            rl.close()
         }
      }

      setTimeout(async () => {
         let code = await EliteProEmpire.requestPairingCode(phoneNumber)
         code = code?.match(/.{1,4}/g)?.join("-") || code
         console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
      }, 3000)
   }
//------------------------------------------------------
    EliteProEmpire.ev.on("connection.update",async  (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            await delay(1000 * 10)
            await EliteProEmpire.sendMessage(EliteProEmpire.user.id, { text: `*ELITEPRO-SESSION-GENERATOR*` });
            let sessionXeon = fs.readFileSync('./sessions/creds.json');
            await delay(1000 * 2) 
             const xeonses = await  EliteProEmpire.sendMessage(EliteProEmpire.user.id, { document: sessionXeon, mimetype: `application/json`, fileName: `creds.json` })
             await EliteProEmpire.sendMessage(EliteProEmpire.user.id, { text: `*╭❍* *SUCCESSFULLY CONNECTED* *❍*
*┊* Please support our channels
*┊*❶  || *ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ* =
https://whatsapp.com/channel/0029VaXaqHII1rcmdDBBsd3g
*┊*❷ || *ᴛᴇʟᴇɢʀᴀᴍ* =
https://t.me/elitepro_md
*┊*➌ || *ʏᴏᴜᴛᴜʙᴇ* =
https://youtube.com/@elitepro-empire
*┊* 📛Don't share code with anyone.
*┊* *ᴠɪꜱɪᴛ ᴏᴜʀ ᴡᴇʙꜱɪᴛᴇ ғᴏʀ ᴍᴏʀᴇ*
https://elite-production.vercel.app
*┊* Upload the file on session folder.
*╰═❍* *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴇʟɪᴛᴇ-ᴘʀᴏ*` }, {quoted: xeonses});
              await delay(1000 * 2) 
              process.exit(0)
        }
        if (
            connection === "close" &&
            lastDisconnect &&
            lastDisconnect.error &&
            lastDisconnect.error.output.statusCode != 401
        ) {
            qr()
        }
    })
    EliteProEmpire.ev.on('creds.update', saveCreds)
    EliteProEmpire.ev.on("messages.upsert",  () => { })
}
qr()

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("Socket connection timeout")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})
