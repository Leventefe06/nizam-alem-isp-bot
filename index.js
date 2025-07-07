const express = require("express");
const { Client, GatewayIntentBits, ActivityType, Status } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const fs = require("fs");
const ms = require("ms");
require("dotenv").config();

// Bot istemcisi
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// JSON verileri
const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));

// Bot hazır olduğunda
client.once("ready", () => {
  console.log(`🕌 Nizam-ı Âlem Isparta botu giriş yaptı: ${client.user.tag}`);

  // Botun durumunu ayarla
  client.user.setPresence({
    status: "dnd", // Rahatsız Etmeyin
    activities: [{ name: "İlahi Nizamı", type: ActivityType.Listening }]
  });

  // Ses kanalına otomatik katıl
  const guild = client.guilds.cache.get("1290220178579390464"); // Sunucu ID
  const kanal = guild?.channels.cache.get("1373607881575759902"); // Ses kanalı ID

  if (kanal && kanal.type === 2) {
    joinVoiceChannel({
      channelId: kanal.id,
      guildId: guild.id,
      adapterCreator: kanal.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });
    console.log("🔊 Bot ses kanalına katıldı.");
  } else {
    console.log("❌ Ses kanalı bulunamadı veya türü ses kanalı değil.");
  }
});

// Mesaj komutları
client.on("messageCreate", async (message) => {
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

  if (komut.startsWith(".zamanasimi")) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("⛔ Bu komutu kullanmak için 'Üyeleri Zaman Aşımına Uğrat' yetkisine sahip olmalısın.");
    }

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
  }

  if (komut.startsWith(".iptal")) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("⛔ Bu komutu kullanmak için yetkin yok.");
    }

    const hedef = message.mentions.members.first();
    if (!hedef || !hedef.isCommunicationDisabled()) {
      return message.reply("⛔ Zaman aşımında olan bir kullanıcı etiketlemelisin.");
    }

    try {
      await hedef.timeout(null);
      message.reply(`✅ ${hedef.user.tag} adlı kullanıcının zaman aşımı kaldırıldı.`);
    } catch (err) {
      console.error(err);
      message.reply("⛔ Zaman aşımı kaldırılamadı. Yetkim yetmiyor olabilir.");
    }
  }
});

// Express keep-alive
const app = express();
app.get("/", (req, res) => {
  res.send("Bot çalışıyor! 🕌");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Keep-alive portu: ${PORT}`);
});

// Giriş
client.login(process.env.TOKEN);
