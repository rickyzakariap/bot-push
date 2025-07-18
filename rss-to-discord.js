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
    // Baca nomor terakhir
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
  let foundArticle = null;
  let foundFeedUrl = null;
  for (const url of rssFeeds) {
    const data = await fetchData(url);
    if (data.length > 0) {
      foundArticle = data[0];
      foundFeedUrl = url;
      break; // Hanya kirim satu artikel dari feed pertama yang ada beritanya
    }
  }

  // Tambahkan timestamp ke log.txt agar selalu ada perubahan
  const now = new Date();
  const timestamp = now.toISOString();
  fs.appendFileSync("log.txt", `Run at: ${timestamp}\n`);

  if (foundArticle) {
    lastNumber++;
    const numberStr = String(lastNumber).padStart(3, '0');
    const payload = {
      content: `**[${numberStr}] ${foundArticle.title}**\n${foundArticle.url}\n(Source: ${foundFeedUrl})`
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
    console.log("No new articles to send from any feed.");
  }

  // Always auto-push
  exec('git add log.txt log_number.txt && git commit -m "auto-update log.txt (numbered)" && git push', (err, stdout, stderr) => {
    if (err) {
      console.error("Git error:", stderr);
    } else {
      console.log("Git push success:", stdout);
    }
  });
}

main(); 