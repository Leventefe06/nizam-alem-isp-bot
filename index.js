const express = require("express");
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const ms = require("ms");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));

client.once("ready", () => {
  console.log(`🕌 Nizam-ı Âlem Isparta botu giriş yaptı: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const komut = message.content.toLowerCase();

  if (komut === ".ayet") {
    const rastgele = ayetler[Math.floor(Math.random() * ayetler.length)];
    return message.channel.send(`📖 **Ayet:** ${rastgele}`);
  }

  if (komut === ".hadis") {
    const rastgele = hadisler[Math.floor(Math.random() * hadisler.length)];
    return message.channel.send(`🕋 **Hadis:** ${rastgele}`);
  }

  if (komut === ".dua") {
    const rastgele = dualar[Math.floor(Math.random() * dualar.length)];
    return message.channel.send(`🤲 **Dua:** ${rastgele}`);
  }

  if (komut.startsWith(".zamanasimi")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("⛔ Bu komutu kullanmak için yetkiniz yok.");
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
      return message.reply(`✅ ${hedef.user.tag} adlı kullanıcı ${sure} süreyle zaman aşımına alındı. Sebep: ${sebep}`);
    } catch (err) {
      console.error(err);
      return message.reply("⛔ Zaman aşımı verilemedi. Yetkim yetmiyor olabilir veya botun rolü kullanıcıdan üstte olmayabilir.");
    }
  }

  // Zaman aşımı iptal komutu
  if (komut.startsWith(".zamanasimiiptal")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("⛔ Bu komutu kullanmak için yetkiniz yok.");
    }

    const hedef = message.mentions.members.first();
    if (!hedef) {
      return message.reply("Kullanım: `.zamanasimiiptal @kullanıcı`");
    }

    try {
      await hedef.timeout(null);
      return message.reply(`✅ ${hedef.user.tag} adlı kullanıcının zaman aşımı kaldırıldı.`);
    } catch (err) {
      console.error(err);
      return message.reply("⛔ Zaman aşımı kaldırılamadı. Yetkim yetmiyor olabilir veya botun rolü kullanıcıdan üstte olmayabilir.");
    }
  }
});

// Express app başlat (Uptime için)
const app = express();
app.get("/", (req, res) => {
  res.send("Bot çalışıyor! 🕌");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

client.login(process.env.TOKEN);
