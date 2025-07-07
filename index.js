const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const fs = require("fs");
require("dotenv").config();
const ms = require("ms"); // süre çevirici

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // Ses durumu için gerekli
  ],
});

// Verileri yükle
const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));

// Bot hazır olunca:
client.once("ready", async () => {
  console.log(`🕌 Nizam-ı Âlem Isparta botu giriş yaptı: ${client.user.tag}`);

  // Durumu "Rahatsız Etmeyin" yap
  client.user.setPresence({
    status: "dnd",
    activities: [{ name: "Nizam-ı Âlem Isparta", type: 0 }],
  });

  // Sunucuyu ve ses kanalını bul
  const guild = client.guilds.cache.first();
  if (!guild) {
    console.error("Bot herhangi bir sunucuya bağlı değil.");
    return;
  }

  // Ses kanalını ismine göre bul
  const channel = guild.channels.cache.find(
    (c) => c.type === 2 && c.name === "Nizam-ı Âlem Isparta"
  );
  if (!channel) {
    console.error("Ses kanalı bulunamadı.");
    return;
  }

  // Ses kanalına bağlan
  try {
    joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    console.log("Ses kanalına bağlanıldı.");
  } catch (error) {
    console.error("Ses kanalına bağlanırken hata:", error);
  }
});

// Mesaj komutları
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const komut = message.content.toLowerCase();

  if (komut === ".ayet") {
    const rastgele = ayetler[Math.floor(Math.random() * ayetler.length)];
    message.channel.send(`📖 **Ayet:** ${rastgele}`);
  }

  if (komut === ".hadis") {
    const rastgele = hadisler[Math.floor(Math.random() * hadisler.length)];
    message.channel.send(`🕋 **Hadis:** ${rastgele}`);
  }

  if (komut === ".dua") {
    const rastgele = dualar[Math.floor(Math.random() * dualar.length)];
    message.channel.send(`🤲 **Dua:** ${rastgele}`);
  }
});

// .zamanasimi komutu
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(".zamanasimi")) return;
  if (!message.member.permissions.has("ModerateMembers")) return;

  const args = message.content.split(" ");
  const hedef = message.mentions.members.first();
  const sure = args[2];
  const sebep = args.slice(3).join(" ") || "Sebep belirtilmedi";

  if (!hedef || !sure) {
    return message.reply("Kullanım: `.zamanasimi @kullanıcı 10m Sebep`");
  }

  const milisaniye = ms(sure);
  if (!milisaniye || milisaniye < 5000 || milisaniye > 28 * 24 * 60 * 60 * 1000) {
    return message.reply("⛔ Süre geçersiz. En az 5 saniye, en fazla 28 gün olabilir.");
  }

  try {
    await hedef.timeout(milisaniye, sebep);
    message.reply(`✅ ${hedef.user.tag} adlı kullanıcı ${sure} süreyle zaman aşımına alındı. Sebep: ${sebep}`);
  } catch (err) {
    console.error(err);
    message.reply("⛔ Zaman aşımı verilemedi. Yetkim yetmiyor olabilir.");
  }
});

// Express app başlat
const app = express();

app.get("/", (req, res) => {
  res.send("Bot çalışıyor! 🕌");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

client.login(process.env.TOKEN);
