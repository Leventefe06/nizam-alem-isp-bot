const express = require("express");
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const ms = require("ms");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

// Verileri yükle
const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));

// Bot hazır olduğunda
client.once("ready", () => {
  console.log(`🕌 Bot aktif: ${client.user.tag}`);
  client.user.setPresence({
    status: "dnd",
    activities: [{ name: "Nizam-ı Âlem Isparta", type: "PLAYING" }],
  });
});

// Yeni üye sunucuya katıldığında
client.on("guildMemberAdd", async (member) => {
  const kayitsizRolId = "1382828727796498472";
  const kayitKanalId = "1297643650703954000";
  const yetkiliRolId = "1382828579171340390";

  try {
    const rol = member.guild.roles.cache.get(kayitsizRolId);
    if (rol) await member.roles.add(rol);

    const hesapOlusma = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;
    const guvenilirMi = (Date.now() - member.user.createdTimestamp) > 15 * 24 * 60 * 60 * 1000
      ? "✅ Güvenilir!"
      : "⚠️ Yeni Hesap";

    const embed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setDescription(`
<@&${yetkiliRolId}>, ${member} sunucuya giriş yaptı.

🇹🇷 **Yeni Bir Kullanıcı Katıldı!**  
🐾 Sunucumuza hoş geldin ${member}!

📊 **Seninle birlikte ${member.guild.memberCount} kişiyiz.**

🗓️ **Hesap oluşturma tarihi:** ${hesapOlusma}  
🔐 **Güvenilirlik durumu:** ${guvenilirMi}
      `)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Nizam-ı Âlem Isparta" });

    const kanal = member.guild.channels.cache.get(kayitKanalId);
    if (kanal && kanal.isTextBased()) {
      kanal.send({ embeds: [embed] });
    }

    // DM gönder
    try {
      await member.send(`🌙 Selamün Aleyküm kardeşim,

Nizam-ı Âlem Isparta sunucusuna hoş geldin!

Kayıt olmak için lütfen sunucudaki 「📝」・ısparta・hoşgeldi̇ni̇z kanalı’na ismini ve yaşını yaz. 

Allah (c.c) senden razı olsun. 🤍`);
    } catch {
      console.log("❌ DM gönderilemedi. Kullanıcının DM’leri kapalı olabilir.");
    }

    console.log(`✅ ${member.user.tag} kayıtsız rolü verildi ve embed mesajı gönderildi.`);
  } catch (error) {
    console.error("❌ Yeni gelen üyeye işlem yapılırken hata oluştu:", error);
  }
});

// Komutlar
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = ".";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const komut = args.shift().toLowerCase();

  // Yardım komutu
if (komut === "help" || komut === "yardım") {
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
            "`📊 .istatistik` → Bot istatistiklerini gösterir.\n" +
            "`🏓 .ping` → Botun gecikmesini gösterir.\n" +
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

    return message.channel.send({ embeds: [embed] });
  }

  // .ping
  if (komut === "ping") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu"))
      return message.reply("⛔ Bu komutu sadece 'Yetkili Kadrosu' kullanabilir.");

    const gecikme = Date.now() - message.createdTimestamp;
    return message.channel.send(`🏓 Pong! Gecikme: ${gecikme}ms`);
  }

  // .istatistik
  if (komut === "istatistik") {
    const toplamUyeler = message.guild.memberCount;
    const kanalSayisi = message.guild.channels.cache.size;
    const uptimeSaat = Math.floor(process.uptime() / 3600);
    const bellekMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    return message.channel.send(
      `📊 **Bot İstatistikleri:**\n` +
      `• 👥 Üye Sayısı: ${toplamUyeler}\n` +
      `• 📂 Kanal Sayısı: ${kanalSayisi}\n` +
      `• 🕒 Çalışma Süresi: ${uptimeSaat} saat\n` +
      `• 💾 Bellek Kullanımı: ${bellekMB} MB\n` +
      `• 🤖 Bot: ${client.user.tag}`
    );
  }

  // .profilim
  if (komut === "profilim") {
    if (!message.guild) return message.reply("Bu komut sadece sunucularda kullanılabilir.");

    const user = message.author;
    const hesapTarihi = `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`;
    const uye = message.member;
    const katilmaTarihi = uye.joinedTimestamp
      ? `<t:${Math.floor(uye.joinedTimestamp / 1000)}:F>`
      : "Bilgi yok";

    const embed = new EmbedBuilder()
      .setColor("#4B0082")
      .setTitle(`${user.tag} - Profil Bilgileri`)
      .addFields(
        { name: "Kullanıcı ID", value: user.id, inline: true },
        { name: "Hesap Oluşturulma", value: hesapTarihi, inline: true },
        { name: "Sunucuya Katılım", value: katilmaTarihi, inline: true }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Nizam-ı Âlem Isparta" });

    return message.channel.send({ embeds: [embed] });
  }

  // .sunucu
  if (komut === "sunucu") {
    try {
      const owner = await message.guild.fetchOwner();
      const kurulus = `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`;

      return message.channel.send(
        `🏰 **Sunucu Bilgisi**\n` +
        `• Ad: ${message.guild.name}\n` +
        `• Sahip: ${owner.user.tag}\n` +
        `• Üye Sayısı: ${message.guild.memberCount}\n` +
        `• Kuruluş Tarihi: ${kurulus}`
      );
    } catch (e) {
      console.error(e);
      return message.channel.send("❌ Sunucu bilgisi alınırken hata oluştu.");
    }
  }

  // .katıldım
  if (komut === "katıldım") {
    if (!message.guild) return message.reply("Bu komut sadece sunucularda kullanılabilir.");

    const uye = message.member;
    const katilmaTarihi = uye.joinedTimestamp
      ? `<t:${Math.floor(uye.joinedTimestamp / 1000)}:F>`
      : "Sunucuya katılım tarihi bilgisi bulunamadı.";

    return message.channel.send(`📅 **Sunucuya katılım tarihin:** ${katilmaTarihi}`);
  }

  // .ayet
  if (komut === "ayet") {
    const rastgele = ayetler[Math.floor(Math.random() * ayetler.length)];
    return message.channel.send(`📖 **Ayet:** ${rastgele}`);
  }

  // .hadis
  if (komut === "hadis") {
    const rastgele = hadisler[Math.floor(Math.random() * hadisler.length)];
    return message.channel.send(`🕋 **Hadis:** ${rastgele}`);
  }

  // .dua
  if (komut === "dua") {
    const rastgele = dualar[Math.floor(Math.random() * dualar.length)];
    return message.channel.send(`🤲 **Dua:** ${rastgele}`);
  }

  // Kayıt komutları .e ve .k
  if (komut === "e" || komut === "k") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu"))
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu rolüne sahip kişiler kullanabilir.");

    const hedef = message.mentions.members.first();
    const isim = args[0];
    const yas = args[1];

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

      if (komut === "e") {
        await hedef.roles.add(beyefendiRolId);
      } else {
        await hedef.roles.add(hanimefendiRolId);
      }

      await hedef.setNickname(`☪ ${isim} | ${yas}`);
      return message.channel.send(`✅ ${hedef} başarıyla kayıt edildi.`);
    } catch (e) {
      console.error(e);
      return message.reply("⛔ Kayıt sırasında bir hata oluştu.");
    }
  }

  // .zamanasimi
  if (komut === "zamanasimi") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu"))
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu kullanabilir.");

    const hedef = message.mentions.members.first();
    const sure = args[0];
    const sebep = args.slice(1).join(" ") || "Sebep belirtilmedi.";

    if (!hedef || !sure) {
      return message.reply("Kullanım: `.zamanasimi @üye 10m Sebep` (saniye: s, dakika: m, saat: h, gün: d)");
    }

    const msSure = ms(sure);
    if (!msSure || isNaN(msSure) || msSure < 5000 || msSure > 28 * 24 * 60 * 60 * 1000) {
      return message.reply("⛔ Süre geçersiz. En az 5 saniye, en fazla 28 gün olabilir.");
    }

    try {
      await hedef.timeout(msSure, sebep);
      return message.reply(`✅ ${hedef.user.tag} ${sure} süreyle zaman aşımına alındı. Sebep: ${sebep}`);
    } catch (e) {
      console.error(e);
      return message.reply("⛔ Yetkim yetersiz olabilir, işlem başarısız.");
    }
  }

  // .iptal
  if (komut === "iptal") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu"))
      return message.reply("⛔ Bu komutu sadece Yetkili Kadrosu kullanabilir.");

    const hedef = message.mentions.members.first();
    if (!hedef) {
      return message.reply("Kullanım: `.iptal @üye`");
    }

    try {
      await hedef.timeout(null);
      return message.reply(`✅ ${hedef.user.tag} zaman aşımı kaldırıldı.`);
    } catch (e) {
      console.error(e);
      return message.reply("⛔ İşlem başarısız. Yetkin yetersiz olabilir.");
    }
  }
});

// Keep-alive için Express
const app = express();
app.get("/", (req, res) => res.send("Bot çalışıyor! 🕌"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Keep-alive portu: ${PORT}`));

// Bot login
client.login(process.env.TOKEN);