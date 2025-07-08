const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const fs = require("fs");
require("dotenv").config();
const ms = require("ms");

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
    status: "dnd",
    activities: [{ name: "Nizam-ı Âlem Isparta", type: 0 }]
  });

  // Ses kanalına katılma
  const guild = client.guilds.cache.get("1290220178579390464"); // Sunucu ID
  const kanalID = "1373607881575759902"; // Ses kanalı ID
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

// Yeni gelen üyeye otomatik rol ve DM gönderme
client.on("guildMemberAdd", async (member) => {
  const kayitsizRolId = "1382828727796498472"; // Kayıtsız rol ID
  const kayitKanalId = "1297643650703954000"; // Kayıt kanalı ID

  try {
    await member.roles.add(kayitsizRolId);

    try {
      await member.send(`🌙 Selamün Aleyküm kardeşim,

Nizam-ı Âlem Isparta sunucusuna hoş geldin!

Kayıt olmak için lütfen sunucudaki #kayıt-kanalı’na ismini ve yaşını yaz.

Allah (c.c) senden razı olsun. 🤍`);
    } catch {
      console.log("❌ DM gönderilemedi. Kullanıcının DM’leri kapalı olabilir.");
    }

    const kanal = member.guild.channels.cache.get(kayitKanalId);
    if (kanal && kanal.isTextBased()) {
      kanal.send(`👋 Hoş geldin ${member}! İsmini ve yaşını yazar mısın?`);
    }

    console.log(`✅ ${member.user.tag} kayıtsız rolü verildi ve hoş geldin mesajı atıldı.`);
  } catch (err) {
    console.error("❌ Yeni gelen üyeye işlem yapılırken hata oluştu:", err);
  }
});

// Mesaj komutları
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const args = message.content.trim().split(/ +/);
  const komut = args[0].toLowerCase();

  // Ayet, Hadis, Dua
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

  // Kayıt komutları
  if (komut === ".e" || komut === ".k") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) {
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu rolüne sahip kişiler kullanabilir.");
    }
    const hedef = message.mentions.members.first();
    if (!hedef) return message.reply("Lütfen kayıt yapılacak üyeyi etiketleyin.");
    const isim = args[2];
    const yas = args[3];
    if (!isim || !yas) return message.reply("Lütfen isim ve yaş bilgisini girin. Örnek: `.e @üye Efe 17`");

    const kayitsizRolId = "1382828727796498472";
    const kayitliRolId = "1291025465577967657";
    const beyefendiRolId = "1297646920830943292";
    const hanimefendiRolId = "1297646174848942101";

    try {
      await hedef.roles.remove(kayitsizRolId);
      await hedef.roles.add(kayitliRolId);

      if (komut === ".e") {
        await hedef.roles.add(beyefendiRolId);
      } else {
        await hedef.roles.add(hanimefendiRolId);
      }

      await hedef.setNickname(`${isim} | ${yas}`);

      message.channel.send(`✅ ${hedef} başarıyla kayıt edildi.`);
    } catch (err) {
      console.error(err);
      message.reply("Kayıt sırasında bir hata oluştu.");
    }
  }

  // Zaman aşımı komutları
  if (komut === ".zamanasimi") {
    const rolKontrol = message.member.roles.cache.some(role => role.name === "Yetkili Kadrosu");
    if (!rolKontrol) return message.reply("⛔ Bu komutu sadece 'Yetkili Kadrosu' rolüne sahip olanlar kullanabilir.");

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

  if (komut === ".iptal") {
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

// Express keep-alive (botun sürekli açık kalması için)
const app = express();
app.get("/", (req, res) => {
  res.send("Bot çalışıyor! 🕌");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Keep-alive portu: ${PORT}`);
});

client.login(process.env.TOKEN);