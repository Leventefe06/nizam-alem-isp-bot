const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const ms = require("ms");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // zaman aşımı için gerekli
  ]
});

// Veri dosyalarını oku
const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));

// Bot hazır olduğunda
client.once("ready", () => {
  console.log(`🕌 Nizam-ı Âlem Isparta botu giriş yaptı: ${client.user.tag}`);
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

  // Zaman Aşımı Komutu
  if (komut.startsWith(".zamanasimi")) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("❌ Bu komutu kullanmak için yetkin yok.");
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
      message.reply("⛔ Zaman aşımı verilemedi. Botun yetkisi yeterli olmayabilir.");
    }
  }
});

// Express sunucu (UptimeRobot için)
const app = express();
app.get("/", (req, res) => {
  res.send("Bot çalışıyor! 🕌");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

// Giriş yap
client.login(process.env.TOKEN);
