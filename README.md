# Auto Push Discord Notifier

1. Set `.env`:
   ```
   DISCORD_WEBHOOK_URL=your_webhook_url
   ```
2. Install:
   ```
   npm install
   ```
3. Run:
   ```
   node post.js
   ```

- Every run: sends random entries to Discord, logs IDs, and pushes to GitHub.

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

Inspired by [@hacktivity-bot](https://github.com/dwisiswant0/hacktivity-bot) 👏
