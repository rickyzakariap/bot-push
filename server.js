import express from "express";

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

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

app.listen(3000, () => {
  console.log("Listening on port 3000");
}); 