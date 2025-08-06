require('dotenv').config();
const fs = require("fs");
const { exec } = require("child_process");
const Parser = require('rss-parser');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const numberFile = "log_number.txt";
let lastNumber = 0;

// Cek jumlah baris log.txt, jika >= 50, reset log dan nomor
let logLines = [];
if (fs.existsSync("log.txt")) {
  logLines = fs.readFileSync("log.txt", "utf-8").split("\n").filter(Boolean);
  if (logLines.length >= 50) {
    fs.writeFileSync("log.txt", "");
    fs.writeFileSync(numberFile, "1");
    lastNumber = 1;
  } else {
    if (fs.existsSync(numberFile)) {
      lastNumber = parseInt(fs.readFileSync(numberFile, "utf-8"), 10) || 0;
    }
  }
} else {
  fs.writeFileSync("log.txt", "");
  if (fs.existsSync(numberFile)) {
    lastNumber = parseInt(fs.readFileSync(numberFile, "utf-8"), 10) || 0;
  }
}

// === BATAS MAKSIMAL ARTIKEL PER HARI ===
// Batas harian sudah diatur di file workflow .yml, jadi bagian ini tidak diperlukan lagi.
const dailyCountFile = "daily_count.txt";
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
let dailyCount = 0;
let lastDate = today;
if (fs.existsSync(dailyCountFile)) {
  const [savedDate, savedCount] = fs.readFileSync(dailyCountFile, "utf-8").split(",");
  if (savedDate === today) {
    dailyCount = parseInt(savedCount, 10) || 0;
  } else {
    dailyCount = 0;
  }
}

const MAX_DAILY = 1;
if (dailyCount >= MAX_DAILY) {
  console.log(`Sudah ${MAX_DAILY} artikel terkirim hari ini, skip kirim artikel.`);
  process.exit(0);
}
// === END BATAS MAKSIMAL ===

// Read all RSS URLs from rss-feeds.txt
const rssFeeds = fs.readFileSync('rss-feeds.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));

async function fetchData(url) {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map(item => ({
      id: item.link,
      title: item.title,
      url: item.link
    }));
  } catch (e) {
    console.error(`Failed to fetch or parse feed: ${url}`);
    return [];
  }
}

async function main() {
  // 1. Pilih satu URL feed secara acak dari daftar
  const randomFeedUrl = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
  console.log(`Fetching from random feed: ${randomFeedUrl}`);

  // 2. Ambil data dari feed yang dipilih secara acak
  const data = await fetchData(randomFeedUrl);
  let foundArticle = null;

  if (data.length > 0) {
    foundArticle = data[0]; // Ambil artikel teratas dari feed tersebut
  }

  // Tambahkan timestamp ke log.txt agar selalu ada perubahan
  const now = new Date();
  const timestamp = now.toISOString();
  fs.appendFileSync("log.txt", `Run at: ${timestamp}\n`);

  if (foundArticle) {
    lastNumber++;
    const numberStr = String(lastNumber).padStart(3, '0');
    const payload = {
      content: `**[${numberStr}] ${foundArticle.title}**\n${foundArticle.url}\n(Source: ${randomFeedUrl})` // Gunakan URL acak sebagai sumber
    };
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      console.log(`${numberStr} OK`);
      fs.appendFileSync("log.txt", numberStr + "\n");
      fs.writeFileSync(numberFile, String(lastNumber));
    } else {
      console.log(`Failed to send ${numberStr}`);
    }
  } else {
    console.log(`No new articles to send from the selected feed: ${randomFeedUrl}`);
  }
}
