require('dotenv').config();
const fs = require("fs");
const { exec } = require("child_process");
const Parser = require('rss-parser');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const RSS_URL = process.env.RSS_URL || 'http://feeds.bbci.co.uk/news/rss.xml'; // Default: BBC News

// Always clear log.txt before each run
fs.writeFileSync("log.txt", "");

// Read the last number from a separate file (or start from 0)
let lastNumber = 0;
const numberFile = "log_number.txt";
if (fs.existsSync(numberFile)) {
  lastNumber = parseInt(fs.readFileSync(numberFile, "utf-8"), 10) || 0;
}

async function fetchData() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);
  return feed.items.map(item => ({
    id: item.link,
    title: item.title,
    url: item.link
  }));
}

async function main() {
  const data = await fetchData();

  // Only send one article per run
  const newArticle = data[0];
  if (newArticle) {
    // Increment the number
    lastNumber++;
    const numberStr = String(lastNumber).padStart(3, '0');

    // Send to Discord
    const payload = {
      content: `**[${numberStr}] ${newArticle.title}**\n${newArticle.url}`
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
    console.log("No new articles to send.");
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