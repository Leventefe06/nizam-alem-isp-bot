const express = require("express");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
require("dotenv").config();
const ms = require("ms");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
});

const ayetler = JSON.parse(fs.readFileSync("./veriler/ayetler.json", "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar = JSON.parse(fs.readFileSync("./veriler/dualar.json", "utf8"));
const kayıtlarPath = "./veriler/kayitlar.json";
let kayıtlar = fs.existsSync(kayıtlarPath) ? JSON.parse(fs.readFileSync(kayıtlarPath, "utf8")) : {};

client.once("ready", () => {
  console.log(`🕌 Bot aktif: ${client.user.tag}`);
  client.user.setPresence({
    status: "dnd",
    activities: [{ name: "Nizam-ı Âlem Isparta", type: 0 }]
  });
});

client.on("guildMemberAdd", async (member) => {
  const kayitsizRolId = "1382828727796498472"; // Kayıtsız rol
  const kayitKanalId = "1297643650703954000";  // Kayıt kanalı
  const sohbetKanalId = "1390347483921780828"; // Genel sohbet kanalı

  try {
    await member.roles.add(kayitsizRolId);

    // DM Mesajı
    try {
      await member.send(`🌙 Selamün Aleyküm kardeşim,

Nizam-ı Âlem Isparta sunucusuna hoş geldin!

Kayıt olmak için lütfen sunucudaki 「📝」・ısparta・hoşgeldi̇ni̇z kanalı’na ismini ve yaşını yaz.

Allah (c.c) senden razı olsun. 🤍`);
    } catch {
      console.log("❌ DM gönderilemedi.");
    }

    // Hoş geldin mesajı → Kayıt kanalına
    const kanal = member.guild.channels.cache.get(kayitKanalId);
    const yetkiliRol = "<@&1382828579171340390>";
    const toplamUye = member.guild.memberCount;

    const olusturmaTarihi = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;
    const suankiZaman = Date.now();
    const fark = suankiZaman - member.user.createdTimestamp;
    const yeniMi = fark < 1000 * 60 * 60 * 24 * 7; // 7 günden küçükse yeni hesap

    if (kanal && kanal.isTextBased()) {
      kanal.send({
        content: `${yetkiliRol}, ${member} sunucuya giriş yaptı.`,
        embeds: [{
          color: 0x5865F2,
          title: "🇹🇷 Yeni Bir Kullanıcı Katıldı!",
          description:
`🐾 Sunucumuza hoş geldin ${member}!

📊 Seninle birlikte **${toplamUye}** kişiyiz.

🗓️ Hesap oluşturma tarihi: ${olusturmaTarihi}
🔐 Güvenilirlik durumu: ${yeniMi ? "⚠️ Yeni Hesap" : "✅ Güvenilir Hesap"}

Nizam-ı Âlem Isparta`,
        }]
      });
    }

    console.log(`✅ ${member.user.tag} kayıtsız olarak eklendi.`);
  } catch (err) {
    console.error("❌ Yeni gelen üyeye işlem yapılamadı:", err);
  }
});


client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const args = message.content.trim().split(/ +/);
  const komut = args[0].toLowerCase();

  // Yardım
  if (komut === ".help" || komut === ".yardım") {
message.channel.send(`🛠️ **Komutlar:**

🌙 \`.ayet\`, \`.hadis\`, \`.dua\`
🔔 \`.ping\`, \`.istatistik\`, \`.sunucu\`
👤 \`.e @üye isim yaş\`, \`.k @üye isim yaş\`
⏳ \`.zamanasimi @üye 10m Sebep\`, \`.iptal @üye\`
🔨 \`.ban @üye Sebep\`, \`.at @üye Sebep\`
📈 \`.kayıtsayı @üye\`

— *Nizam-ı Âlem Isparta Yönetimi*`);

  }

  // Kayıt komutları
  if (komut === ".e" || komut === ".k") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) return;

    const hedef = message.mentions.members.first();
    const isim = args[2];
    const yas = args[3];
    if (!hedef || !isim || !yas) return;

    const kayitsizRolId = "1382828727796498472";
    const kayitliRolId = "1291025465577967657";
    const beyefendiRolId = "1297646920830943292";
    const hanimefendiRolId = "1297646174848942101";

    await hedef.roles.remove(kayitsizRolId);
    await hedef.roles.add(kayitliRolId);
    if (komut === ".e") await hedef.roles.add(beyefendiRolId);
    else await hedef.roles.add(hanimefendiRolId);
    await hedef.setNickname(`☪ ${isim} | ${yas}`);

    kayıtlar[hedef.id] = (kayıtlar[hedef.id] || 0) + 1;
    fs.writeFileSync(kayıtlarPath, JSON.stringify(kayıtlar));

    message.channel.send(`✅ ${hedef} başarıyla kayıt edildi.`);
    // Kayıt sonrası genel sohbete hoş geldin mesajı
const sohbetKanalId = "1390347483921780828";
const sohbetKanal = message.guild.channels.cache.get(sohbetKanalId);
if (sohbetKanal && sohbetKanal.isTextBased()) {
  sohbetKanal.send(`🌟 Aramıza katıldığın için teşekkürler ${hedef}! Hayırlı, huzurlu ve seviyeli bir ortam dileriz.`);
}
  }

  if (komut === ".kayıtsayı") {
    const hedef = message.mentions.users.first() || message.author;
    const sayi = kayıtlar[hedef.id] || 0;
    message.channel.send(`📊 ${hedef.username} toplam ${sayi} kayıt yapmış.`);
  }

  // Zaman aşımı
  if (komut === ".zamanasimi") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) return;
    const hedef = message.mentions.members.first();
    const sure = args[2];
    const sebep = args.slice(3).join(" ") || "Sebep belirtilmedi";
    const msSure = ms(sure);
    if (!hedef || !sure || !msSure) return;

    await hedef.timeout(msSure, sebep);
    message.channel.send(`⏳ ${hedef.user.tag} ${sure} zaman aşımına alındı. Sebep: ${sebep}`);
  }

  if (komut === ".iptal") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) return;
    const hedef = message.mentions.members.first();
    if (!hedef) return;
    await hedef.timeout(null);
    message.channel.send(`✅ ${hedef.user.tag} için zaman aşımı kaldırıldı.`);
  }

  // Sunucu komutları
  if (komut === ".sunucu") {
    const owner = await message.guild.fetchOwner();
    message.channel.send(`👑 Sunucu Sahibi: ${owner.user.tag}`);
  }

  if (komut === ".ping") {
    message.channel.send(`🏓 Ping: ${client.ws.ping}ms`);
  }

  if (komut === ".istatistik") {
    message.channel.send(`📊 Toplam Üye: ${message.guild.memberCount}`);
  }

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

  // Ban ve At komutu
  if (komut === ".ban" || komut === ".at") {
    const rollereYetkili = ["🥇", "🥈", "🥉"];
    const yetkili = message.member.roles.cache.some(role => rollereYetkili.includes(role.name));
    if (!yetkili) return;

    const hedef = message.mentions.members.first();
    const sebep = args.slice(2).join(" ") || "Sebep belirtilmedi";
    if (!hedef) return;

    try {
      if (komut === ".ban") {
        await hedef.ban({ reason: sebep });
        message.channel.send(`⛔ ${hedef.user.tag} banlandı. Sebep: ${sebep}`);
      } else {
        await hedef.kick(sebep);
        message.channel.send(`🚪 ${hedef.user.tag} atıldı. Sebep: ${sebep}`);
      }
    } catch (err) {
      console.error(err);
      message.reply("İşlem başarısız. Yetkim yetersiz olabilir.");
    }
  }
});

const app = express();
app.get("/", (req, res) => res.send("Bot çalışıyor! 🕌"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Keep-alive portu: ${PORT}`));
client.login(process.env.TOKEN);
