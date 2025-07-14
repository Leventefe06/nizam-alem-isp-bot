const express = require("express");
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
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

// ───── JSON verileri
const ayetler  = JSON.parse(fs.readFileSync("./veriler/ayetler.json",  "utf8"));
const hadisler = JSON.parse(fs.readFileSync("./veriler/hadisler.json", "utf8"));
const dualar   = JSON.parse(fs.readFileSync("./veriler/dualar.json",   "utf8"));
const kayıtlarPath = "./veriler/kayitlar.json";
if (!fs.existsSync(kayıtlarPath)) fs.writeFileSync(kayıtlarPath, "{}");
let kayıtlar = JSON.parse(fs.readFileSync(kayıtlarPath, "utf8"));

// ───── Roller / Kanallar
const ROL = {
  kayitsiz:  "1382828727796498472",
  kayitli:   "1291025465577967657",
  erkek:     "1297646920830943292",
  kiz:       "1297646174848942101",
  yetkiliEtiket: "1382828579171340390"
};
const YETKILI_ROL_IDS = [
  "1382828368248045639", // 🥇
  "1382828330721742888", // 🥈
  "1382828306059100160", // 🥉
  "1382828276455706645"  // yeni
];
const KANAL = {
  kayit:  "1297643650703954000", // 「📝」・ısparta・hoşgeldi̇ni̇z
  sohbet: "1390347483921780828"
};

// ───── Bot hazır
client.once("ready", () => {
  console.log(`🕌 Bot aktif: ${client.user.tag}`);
  client.user.setPresence({
    status: "dnd",
    activities: [{ name: "Nizam-ı Âlem Isparta", type: 0 }]
  });
});

// ───── Yeni üye
client.on("guildMemberAdd", async (member) => {
  try {
    await member.roles.add(ROL.kayitsiz);

    // DM
    await member.send(`🌙 Selamün Aleyküm kardeşim,

Nizam-ı Âlem Isparta sunucusuna hoş geldin!

Kayıt olmak için lütfen sunucudaki 「📝」・ısparta・hoşgeldi̇ni̇z kanalı’na ismini ve yaşını yaz.

Allah (c.c) senden razı olsun. 🤍`).catch(()=>{});

    // Kayıt kanalı hoş‑geldin
    const kanal = member.guild.channels.cache.get(KANAL.kayit);
    if (kanal?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("🇹🇷 Yeni Bir Kullanıcı Katıldı!")
        .setDescription(
          `🐾 Sunucumuza hoş geldin ${member}!\n\n` +
          `📊 Seninle birlikte **${member.guild.memberCount}** kişiyiz.\n\n` +
          `🗓️ Hesap oluşturma tarihi: <t:${Math.floor(member.user.createdTimestamp/1000)}:F>\n` +
          `🔐 Güvenilirlik durumu: ${Date.now()-member.user.createdTimestamp < 604800000 ? "⚠️ Yeni Hesap" : "✅ Güvenilir Hesap"}\n\n` +
          `Nizam-ı Âlem Isparta`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic:true }));
      kanal.send({ content: `<@&${ROL.yetkiliEtiket}>, ${member} sunucuya giriş yaptı.`, embeds:[embed] });
    }

  } catch (err) {
    console.error("Yeni üye işlemi hatası:", err);
  }
});

// ───── Mesaj komutları
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const args  = message.content.trim().split(/\s+/);
  const komut = args[0].toLowerCase();

  // Yardım
  if (komut === ".help" || komut === ".yardım") {
    return message.channel.send(`🛠️ **Komutlar:**

🌙 \`.ayet\`, \`.hadis\`, \`.dua\`
🔔 \`.ping\`, \`.istatistik\`, \`.sunucu\`
👤 \`.e @üye isim yaş\`, \`.k @üye isim yaş\`
⏳ \`.zamanasimi @üye 10m Sebep\`, \`.iptal @üye\`
🔨 \`.ban @üye Sebep\`, \`.at @üye Sebep\`
📈 \`.kayıtsayı @üye\`

— *Nizam-ı Âlem Isparta Yönetimi*`);
  }

  // Üyelere açık basit komutlar
  if (komut === ".ping")  return message.channel.send(`🏓 Ping: ${client.ws.ping}ms`);
  if (komut === ".istatistik") return message.channel.send(`📊 Toplam Üye: ${message.guild.memberCount}`);
  if (komut === ".sunucu") {
    const owner = await message.guild.fetchOwner();
    return message.channel.send(`👑 Sunucu Sahibi: ${owner.user.tag}`);
  }
  if (komut === ".ayet")  return message.channel.send(`📖 **Ayet:** ${ayetler[Math.floor(Math.random()*ayetler.length)]}`);
  if (komut === ".hadis") return message.channel.send(`🕋 **Hadis:** ${hadisler[Math.floor(Math.random()*hadisler.length)]}`);
  if (komut === ".dua")   return message.channel.send(`🤲 **Dua:** ${dualar[Math.floor(Math.random()*dualar.length)]}`);

  // Kayıt komutları
  if (komut === ".e" || komut === ".k") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) return;
    const hedef = message.mentions.members.first();
    const isim  = args[2]; 
    const yas = args[3];
    if (!hedef || !isim || !yas || isNaN(yas)) return message.reply("Kullanım: `.e @üye isim yaş` (Yaş sayı olmalı)");

    try {
      await hedef.roles.remove(ROL.kayitsiz);
      await hedef.roles.add(ROL.kayitli);
      await hedef.roles.add(komut === ".e" ? ROL.erkek : ROL.kiz);
      await hedef.setNickname(`☪ ${isim} | ${yas}`);

      // Kayıt sayacı
      const kayıtEden = message.member;
      kayıtlar[kayıtEden.id] = (kayıtlar[kayıtEden.id] || 0) + 1;
      fs.writeFileSync(kayıtlarPath, JSON.stringify(kayıtlar, null, 2));

      const kayıtTürü = komut === ".e" ? "erkek" : "kız";
      const kayıtSayısı = kayıtlar[kayıtEden.id] || 0;

      // Embed mesajı obje olarak tanımla
      const kayıtEmbed = {
        color: 0x2ECC71,
        author: {
          name: "✅ Kayıt Yapıldı!",
          icon_url: "https://i.imgur.com/62xkxdC.png"
        },
        description: "Kayıt bilgileri aşağıdadır.",
        fields: [
          {
            name: "• Kayıt Edilen Kullanıcı",
            value: `${hedef}`,
            inline: false
          },
          {
            name: "• Kayıt Eden Kullanıcı",
            value: `${kayıtEden}`,
            inline: false
          },
          {
            name: "• Verilen Roller",
            value: `<@&${ROL.kayitli}> ${kayıtTürü === "erkek" ? `<@&${ROL.erkek}>` : `<@&${ROL.kiz}>`}`,
            inline: false
          },
          {
            name: "• Yeni İsim",
            value: `☪ ${isim} | ${yas}`,
            inline: false
          },
          {
            name: "• Kayıt Türü",
            value: `${kayıtTürü}`,
            inline: true
          },
          {
            name: `• ${kayıtEden.user.username} kayıt sayın`,
            value: `${kayıtSayısı}`,
            inline: true
          }
        ],
        thumbnail: {
          url: hedef.user.displayAvatarURL({ dynamic: true })
        },
        footer: {
          text: "Nizam-ı Âlem Isparta"
        }
      };

      message.channel.send({ embeds: [kayıtEmbed] });

      // Sohbet kanalına duyuru
      const sohbet = message.guild.channels.cache.get(KANAL.sohbet);
      sohbet?.isTextBased() && sohbet.send(`🌟 Aramıza katıldığın için teşekkürler ${hedef}! Hayırlı, huzurlu ve seviyeli bir ortam dileriz.`);

    } catch(err) { 
      console.error(err); 
      message.reply("Kayıt sırasında hata oluştu."); 
    }
  }

  if (komut === ".kayıtsayı") {
    const hedef = message.mentions.users.first() || message.author;
    const sayi = kayıtlar[hedef.id] || 0;
    return message.channel.send(`📊 ${hedef.username} toplam **${sayi}** kayıt yaptı.`);
  }

  // Zaman aşımı komutları
  if (komut === ".zamanasimi") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) return;
    const hedef = message.mentions.members.first();
    const süre  = args[2]; 
    const sebep = args.slice(3).join(" ") || "Sebep belirtilmedi";
    const msSüre = ms(süre);
    if (!hedef || !msSüre) return message.reply("Kullanım: `.zamanasimi @üye 10m Sebep`");
    await hedef.timeout(msSüre, sebep);
    message.channel.send(`⏳ ${hedef.user.tag} ${süre} susturuldu. Sebep: ${sebep}`);
  }

  if (komut === ".iptal") {
    if (!message.member.roles.cache.some(r => r.name === "Yetkili Kadrosu")) return;
    const hedef = message.mentions.members.first();
    if (!hedef) return;
    await hedef.timeout(null);
    message.channel.send(`✅ ${hedef.user.tag} için zaman aşımı kaldırıldı.`);
  }

  // Ban / At
  if (komut === ".ban" || komut === ".at") {
    const yetkili = message.member.roles.cache.some(role => YETKILI_ROL_IDS.includes(role.id));
    if (!yetkili) return;
    const hedef = message.mentions.members.first();
    const sebep = args.slice(2).join(" ") || "Sebep belirtilmedi";
    if (!hedef) return;
    try {
      if (komut === ".ban") { 
        await hedef.ban({ reason: sebep }); 
        message.channel.send(`⛔ ${hedef.user.tag} banlandı. Sebep: ${sebep}`); 
      }
      else { 
        await hedef.kick(sebep); 
        message.channel.send(`🚪 ${hedef.user.tag} atıldı. Sebep: ${sebep}`); 
      }
    } catch(err){ 
      console.error(err); 
      message.reply("İşlem başarısız."); 
    }
  }
});

// ───── Keep‑alive
const app = express();
app.get("/", (_,res)=>res.send("Bot çalışıyor! 🕌"));
app.listen(process.env.PORT || 3000, ()=>console.log("🌐 Keep‑alive aktif"));

// ───── Token
client.login(process.env.TOKEN);