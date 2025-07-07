const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
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

// Express app başlat
const app = express();

app.get("/", (req, res) => {
  res.send("Bot çalışıyor! 🕌");
});

// Render'ın verdiği PORT'u kullan
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});

client.login(process.env.TOKEN);
