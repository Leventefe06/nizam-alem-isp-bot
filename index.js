const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const fs = require("fs");
require("dotenv").config();
const ms = require("ms"); // zaman aşımı için süre çevirici

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel],
});

// Veriler
const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));

// Bot hazır olduğunda
client.once("ready", () => {
  console.log(`🕌 Bot aktif: ${client.user.tag}`);
  client.user.setPresence({
    status: "dnd", // rahatsız etmeyin
    activities: [{ name: "Nizam-ı Âlem Isparta", type: 0 }]
  });

  // Botu belirli bir ses kanalına sok
  const guild = client.guilds.cache.get("1290220178579390464"); // sunucu ID
  const kanalID = "1373607881575759902"; // ses kanalı ID
  if (guild) {
    const kanal = guild.channels.cache.get(kanalID);
    if (kanal && kanal.isVoiceBased()) {
      joinVoiceChannel({
        channelId: kanal.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
      });
      console.log("🔊 Ses kanalına katıldı.");
    }
  }
});

// Mesajlara yanıtlar
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

// .zamanasimi komutu
if (komut.startsWith(".zamanasimi")) {
  const rolKontrol = message.member.roles.cache.some(role => role.name === "Yetkili Kadrosu");
  if (!rolKontrol) return message.reply("⛔ Bu komutu sadece 'Yetkili Kadrosu' rolüne sahip olanlar kullanabilir.");

  const args = komut.split(" ");
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

// .iptal komutu
if (komut.startsWith(".iptal")) {
  const rolKontrol = message.member.roles.cache.some(role => role.name === "Yetkili Kadrosu");
  if (!rolKontrol) return message.reply("⛔ Bu komutu sadece 'Yetkili Kadrosu' rolüne sahip olanlar kullanabilir.");

  const hedef = message.mentions.members.first();
  if (!hedef) return message.reply("Kullanım: `.iptal @kullanıcı`");

  try {
    await hedef.timeout(null);
    message.reply(`✅ ${hedef.user.tag} için zaman aşımı kaldırıldı.`);
  } catch (err) {
    console.error(err);
    message.reply("⛔ İşlem başarısız. Yetkim yeterli olmayabilir.");
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
client.on("guildMemberAdd", async (member) => {
  const kayitsizRolId = "1382828727796498472"; // ← BURAYA kayıtsız rolünün ID'sini yaz
  const kayitKanalId = "1297643650703954000"; // ← Bu senin kayıt kanalının ID’si

  try {
    // Kayıtsız rolünü ver
    await member.roles.add(kayitsizRolId);

    // DM mesajı gönder
    try {
      await member.send(`🌙 Selamün Aleyküm kardeşim,

Nizam-ı Âlem Isparta sunucusuna hoş geldin!

Kayıt olmak için lütfen sunucudaki #kayıt-kanalı’na ismini ve yaşını yaz.

Allah (c.c) senden razı olsun. 🤍`);
    } catch (dmErr) {
      console.log("❌ DM gönderilemedi. Kullanıcının DM’leri kapalı olabilir.");
    }

    // Sunucudaki kayıt kanalına mesaj gönder
    const kanal = member.guild.channels.cache.get(kayitKanalId);
    if (kanal && kanal.isTextBased()) {
      kanal.send(`👋 Hoş geldin ${member}! İsmini ve yaşını yazar mısın?`);
    }

    console.log(`✅ ${member.user.tag} adlı kullanıcıya kayıtsız rolü verildi ve hoş geldin mesajı atıldı.`);
  } catch (err) {
    console.error("❌ Yeni gelen üyeye işlem yapılırken hata oluştu:", err);
  }
});

client.login(process.env.TOKEN);