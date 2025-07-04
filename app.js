import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { appendFile } from "fs/promises";
import { exec } from "child_process";

// Load env (Bun auto-loads .env, Node.js: use dotenv)
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// --- Discord Bot: Listen to messages, log, and auto-push ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== DISCORD_CHANNEL_ID) return;

  // Tulis pesan ke log.txt
  await appendFile("log.txt", `${message.author.username}: ${message.content}\n`);

  // Auto git push
  exec('git add log.txt && git commit -m "update log.txt from Discord" && git push', (err, stdout, stderr) => {
    if (err) {
      console.error("Git error:", stderr);
    } else {
      console.log("Git push success:", stdout);
    }
  });
});

client.login(DISCORD_BOT_TOKEN);

// --- Express Server: GitHub webhook relay to Discord ---
const app = express();
app.use(express.json());

app.post("/github", async (req, res) => {
  const { pusher, repository, commits, compare } = req.body;
  if (!commits || commits.length === 0) return res.sendStatus(204);

  const commitMessages = commits.map(
    c => `[\`${c.id.slice(0,7)}\`](${c.url}) ${c.message} - ${c.author.name}`
  ).join("\n");

  const payload = {
    content: `**${pusher.name}** pushed to [${repository.full_name}](${repository.html_url})\n${commitMessages}\n[Compare changes](${compare})`
  };

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
}); 