require('dotenv').config();
const fs = require("fs");
const { exec } = require("child_process");

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// 1. Baca log.txt (jika belum ada, buat kosong)
let log = [];
if (fs.existsSync("log.txt")) {
  log = fs.readFileSync("log.txt", "utf-8").split("\n").filter(Boolean);
}

// 2. Fetch data eksternal: random IDs and random count
async function fetchData() {
  const count = Math.floor(Math.random() * 10) + 1; // 1-10 random entries
  return Array.from({ length: count }, (_, i) => ({
    id: Math.random().toString(36).slice(2, 10) + Date.now(),
    title: `Random Entry #${i + 1}`,
    url: `https://example.com/random/${i + 1}`
  }));
}

// 3. Kirim ke Discord jika belum ada di log.txt
async function main() {
  const data = await fetchData();
  let updated = false;

  for (const item of data) {
    if (log.includes(item.id)) {
      console.log(`${item.id} skipping...`);
      continue;
    }

    // Kirim ke Discord
    const payload = {
      content: `**${item.title}**\n${item.url}`
    };
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`${item.id} OK`);
      fs.appendFileSync("log.txt", item.id + "\n");
      updated = true;
      await new Promise(r => setTimeout(r, 2000)); // delay biar tidak spam
    } else {
      console.log(`Failed to send ${item.id}`);
    }
  }

  // Selalu lakukan auto-push, meskipun tidak ada update
  exec('git add log.txt && git commit -m "auto-update log.txt (force)" && git push', (err, stdout, stderr) => {
    if (err) {
      console.error("Git error:", stderr);
    } else {
      console.log("Git push success:", stdout);
    }
  });
}

main(); 