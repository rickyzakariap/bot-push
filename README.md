# Auto Push Discord Notifier

This script automatically:
- Fetches data from a free API (JSONPlaceholder by default)
- Sends notifications to Discord via webhook
- Stores sent data IDs in `log.txt`
- Auto-commits and pushes `log.txt` to GitHub every run

## How to Use

1. **Clone the repo & install dependencies**
   ```bash
   git clone <repo-url>
   cd <folder>
   bun install
   # or npm install if you use node-fetch (not required for Node.js v18+)
   ```

2. **Create a `.env` file**
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_webhook_token
   ```

3. **Run the script**
   ```bash
   node post.js
   # or bun run post.js
   ```

4. **Check Discord**
   - Notifications will appear in the Discord channel linked to your webhook.

5. **Check GitHub**
   - Every time `log.txt` is updated, the script will auto-commit & push to your GitHub repo.

## Customization
- To change the data source, edit the `fetchData()` function in `post.js`.
- To change the Discord message format, edit the payload section in `post.js`.
- **Random IDs and random count:**
  - You can modify `fetchData()` to generate random IDs and a random number of entries each day. See below for an example.

## Example: Random IDs and Random Count
Replace `fetchData()` with:
```js
async function fetchData() {
  const count = Math.floor(Math.random() * 10) + 1; // 1-10 random entries
  return Array.from({ length: count }, (_, i) => ({
    id: Math.random().toString(36).slice(2, 10) + Date.now(),
    title: `Random Entry #${i + 1}`,
    url: `https://example.com/random/${i + 1}`
  }));
}
```

## Notes
- Make sure your git remote and credentials are set up so auto-push works smoothly.
- `log.txt` is ignored by `.gitignore` (edit if you want it to appear in the repo).

---

Inspired by [@bot-push (hacktivity-bot)](https://github.com/dwisiswant0/hacktivity-bot) 