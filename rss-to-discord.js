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
const dailyCountFile = "daily_count.txt";
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
let dailyCount = 0;
if (fs.existsSync(dailyCountFile)) {
  const [savedDate, savedCount] = fs.readFileSync(dailyCountFile, "utf-8").split(",");
  if (savedDate === today) {
    dailyCount = parseInt(savedCount, 10) || 0;
  } else {
    dailyCount = 0;
  }
}

const MAX_DAILY = 3; // Increase for more posts per day
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

// Read posted article IDs from log.txt
let postedIds = [];
if (fs.existsSync("log.txt")) {
  postedIds = fs.readFileSync("log.txt", "utf-8").split("\n").filter(Boolean);
}

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchAllArticles() {
  const parser = new Parser();
  let allArticles = [];
  for (const url of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);
      const articles = feed.items.map(item => ({
        id: item.link,
        title: item.title,
        url: item.link,
        feedUrl: url
      }));
      allArticles = allArticles.concat(articles);
    } catch (e) {
      console.error(`Failed to fetch or parse feed: ${url}`);
    }
  }
  return allArticles;
}

function getRandomUnpostedArticle(articles, postedIds) {
  const unposted = articles.filter(a => !postedIds.includes(a.id));
  if (unposted.length === 0) return null;
  const idx = Math.floor(Math.random() * unposted.length);
  return unposted[idx];
}

async function main() {
  console.log("Fetching all articles from RSS feeds...");
  const allArticles = await fetchAllArticles();
  console.log(`Total articles fetched: ${allArticles.length}`);
  const article = getRandomUnpostedArticle(allArticles, postedIds);
  if (!article) {
    console.log("No new articles to send from any feed.");
    return;
  }

  // Post to Discord
  const payload = {
    content: `**${article.title}**\n${article.url}\n(Source: ${article.feedUrl})`
  };
  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    console.log(`Posted: ${article.id}`);
    fs.appendFileSync("log.txt", article.id + "\n");
    // Update daily count
    dailyCount++;
    fs.writeFileSync(dailyCountFile, `${today},${dailyCount}`);
  } else {
    console.log(`Failed to send ${article.id}`);
  }

  // Always auto-push
  exec('git add log.txt daily_count.txt && git commit -m "auto-update log.txt (random RSS)" && git push', (err, stdout, stderr) => {
    if (err) {
      console.error("Git error:", stderr);
    } else {
      console.log("Git push success:", stdout);
    }
  });
}

main(); 
