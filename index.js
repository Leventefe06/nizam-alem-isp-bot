const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
require("dotenv").config();
const ms = require("ms");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel],
});

// JSON verileri
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
});

// Yeni üye girdiğinde
client.on("guildMemberAdd", async (member) => {
  const kayitsizRolId = "1382828727796498472";
  const kayitKanalId = "1297643650703954000";
  const yetkiliRolId = "1382828579171340390";

  try {
    await member.roles.add(kayitsizRolId);

    // Embed mesajı
    const hesapOlusma = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;
    const güvenilirMi = (Date.now() - member.user.createdTimestamp) > (15 * 24 * 60 * 60 * 1000)
      ? "✅ Güvenilir!" : "⚠️ Yeni Hesap";

    const embed = {
      color: 0x2b2d31,
      description: `
<@&${yetkiliRolId}>, ${member} sunucuya giriş yaptı.

🇹🇷 **Yeni Bir Kullanıcı Katıldı!**  
🐾 Sunucumuza hoş geldin ${member}!

📊 **Seninle birlikte ${member.guild.memberCount} kişiyiz.**

🗓️ **Hesap oluşturma tarihi:** ${hesapOlusma}  
🔐 **Güvenilirlik durumu:** ${güvenilirMi}`,
      thumbnail: {
        url: member.user.displayAvatarURL({ dynamic: true })
      },
      footer: {
        text: "Nizam-ı Âlem Isparta"
      }
    };

    const kanal = member.guild.channels.cache.get(kayitKanalId);
    if (kanal && kanal.isTextBased()) {
      kanal.send({ embeds: [embed] });
    }

    // DM mesajı
    try {
      await member.send(`🌙 Selamün Aleyküm kardeşim,

Nizam-ı Âlem Isparta sunucusuna hoş geldin!

Kayıt olmak için lütfen sunucudaki 「📝」・ısparta・hoşgeldi̇ni̇z kanalı’na ismini ve yaşını yaz. 

Allah (c.c) senden razı olsun. 🤍`);
    } catch {
      console.log("❌ DM gönderilemedi. Kullanıcının DM’leri kapalı olabilir.");
    }

    console.log(`✅ ${member.user.tag} kayıtsız rolü verildi ve embed mesajı gönderildi.`);
  } catch (err) {
    console.error("❌ Yeni gelen üyeye işlem yapılırken hata oluştu:", err);
  }
});

// Mesaj komutları
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const args = message.content.trim().split(/ +/);
  const komut = args[0].toLowerCase();
if (komut === ".help") {
  const { EmbedBuilder } = require("discord.js");

  const embed = new EmbedBuilder()
    .setColor("#4B0082")
    .setTitle("📘 Komut Yardım Menüsü")
    .setDescription("Aşağıda bot komutlarını kategorilere ayrılmış şekilde bulabilirsin.")
    .addFields(
      {
        name: "👤 Üye Komutları",
        value:
          "`📖 .ayet` → Rastgele bir ayet gönderir.\n" +
          "`🕋 .hadis` → Rastgele bir hadis gönderir.\n" +
          "`🤲 .dua` → Rastgele bir dua gönderir.\n" +
          "`👑 .sunucu` → Sunucu sahibini gösterir.\n" +
          "`📅 .katıldım` → Ne zaman katıldığını gösterir.\n" +
          "`🧾 .profilim` → Hesap bilgilerini gösterir.\n" +
          "`📊 .sunucubilgi` → Sunucu hakkında bilgi verir.\n" +
          "`📌 .kurallar` → Kurallar kanalını gösterir.",
      },
      {
        name: "🛠️ Yetkili Komutları",
        value:
          "`✅ .e @üye İsim Yaş` → Erkek kullanıcıyı kayıt eder.\n" +
          "`✅ .k @üye İsim Yaş` → Kadın kullanıcıyı kayıt eder.\n" +
          "`⏰ .zamanasimi @üye 10m Sebep` → Zaman aşımı verir.\n" +
          "`🔓 .iptal @üye` → Zaman aşımını kaldırır.",
      }
    )
    .setFooter({ text: "— Nizam-ı Âlem Isparta Bot Yardım Sistemi" });

  message.channel.send({ embeds: [embed] });
}

// Üyelere açık komutlar
  if (komut === ".sunucu") {
    const owner = await message.guild.fetchOwner();
    message.channel.send(`👑 Sunucu Sahibi: ${owner.user.tag}`);
  }

  if (komut === ".katıldım") {
    const tarih = `<t:${Math.floor(message.member.joinedTimestamp / 1000)}:R>`;
    message.channel.send(`📅 Sunucuya katılma tarihin: ${tarih}`);
  }

  if (komut === ".profilim") {
    const user = message.author;
    const hesapTarihi = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
    message.channel.send(`🧾 **Profil Bilgileri**
- Kullanıcı: ${user.tag}
- ID: ${user.id}
- Hesap Oluşturulma: ${hesapTarihi}`);
  }

  if (komut === ".sunucubilgi") {
    const sunucu = message.guild;
    const kurulus = `<t:${Math.floor(sunucu.createdTimestamp / 1000)}:F>`;
    message.channel.send(`📊 **Sunucu Bilgisi**
- Ad: ${sunucu.name}
- Üye Sayısı: ${sunucu.memberCount}
- Kuruluş: ${kurulus}`);
  }

  if (komut === ".kurallar") {
    message.channel.send("📌 Sunucu kurallarını şu kanalda bulabilirsin: <#1353793603050274867>");
  }

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

  // Kayıt Komutları
  if (komut === ".e" || komut === ".k") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) {
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu rolüne sahip kişiler kullanabilir.");
    }
    const hedef = message.mentions.members.first();
    const isim = args[2];
    const yas = args[3];
    if (!hedef || !isim || !yas) {
      return message.reply("Kullanım: `.e @üye isim yaş`");
    }

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

      await hedef.setNickname(`☪ ${isim} | ${yas}`);
      message.channel.send(`✅ ${hedef} başarıyla kayıt edildi.`);
    } catch (err) {
      console.error(err);
      message.reply("⛔ Kayıt sırasında bir hata oluştu.");
    }
  }

  // Zaman Aşımı Komutu
  if (komut === ".zamanasimi") {
    if (!message.member.roles.cache.some(role => role.name === "Yetkili Kadrosu"))
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu kullanabilir.");

    const hedef = message.mentions.members.first();
    const sure = args[2];
    const sebep = args.slice(3).join(" ") || "Sebep belirtilmedi.";

    if (!hedef || !sure) {
      return message.reply("Kullanım: `.zamanasimi @üye 10m Sebep` (saniye: s, dakika: m, saat: h, gün: d)");
    }

    const msSure = ms(sure);
    if (!msSure || msSure < 5000 || msSure > 28 * 24 * 60 * 60 * 1000)
      return message.reply("⛔ Süre geçersiz. En az 5 saniye, en fazla 28 gün olabilir.");

    try {
      await hedef.timeout(msSure, sebep);
      message.reply(`✅ ${hedef.user.tag} ${sure} süreyle zaman aşımına alındı. Sebep: ${sebep}`);
    } catch (err) {
      console.error(err);
      message.reply("⛔ Yetkim yetersiz olabilir, işlem başarısız.");
    }
  }

  if (komut === ".iptal") {
    if (!message.member.roles.cache.some(role => role.name === "Yetkili Kadrosu"))
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu kullanabilir.");

    const hedef = message.mentions.members.first();
    if (!hedef) return message.reply("Kullanım: `.iptal @üye`");

    try {
      await hedef.timeout(null);
      message.reply(`✅ ${hedef.user.tag} zaman aşımı kaldırıldı.`);
    } catch (err) {
      console.error(err);
      message.reply("⛔ İşlem başarısız. Yetkin yetersiz olabilir.");
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

client.login(process.env.TOKEN);
