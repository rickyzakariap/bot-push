import { Client, GatewayIntentBits } from "discord.js";
import { appendFile } from "fs/promises";
import { exec } from "child_process";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; // ID channel yang ingin dipantau

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;

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

client.login(TOKEN); 