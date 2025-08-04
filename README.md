# RSS to Discord Auto Poster

This project automatically fetches news from multiple RSS feeds and posts them to a Discord channel using a webhook. It is designed to run daily via GitHub Actions and limits the number of articles sent per day.

## Quick Setup

1. **Environment Variables**
   - Create a `.env` file with your Discord webhook:
     ```
     DISCORD_WEBHOOK_URL=your_discord_webhook_url
     ```

2. **RSS Feeds**
   - Add your RSS feed URLs to `rss-feeds.txt`, one per line.

3. **Install Dependencies**
   ```
   npm install
   ```

4. **Manual Run**
   ```
   node rss-to-discord.js
   ```

## GitHub Actions Automation
- The workflow runs automatically on a schedule (see `.github/workflows/rss-to-discord.yml`).
- **Daily Limit:** Only 10 articles are sent per day. The count resets every day.
- **Log Rotation:** When `log.txt` reaches 50 lines, it is cleared and numbering restarts from 1.
- **Commit Author:** Commits are made using your GitHub username and email (requires a Personal Access Token).

### Setup Personal Access Token (PAT)
1. Create a PAT with `repo` scope at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).
2. Add the token to your repository secrets as `GH_PAT`.

## Files
- `rss-to-discord.js` — Main script
- `rss-feeds.txt` — List of RSS feed URLs
- `log.txt` — Log of sent articles
- `log_number.txt` — Last article number
- `daily_count.txt` — Daily sent counter

---

Inspired by [@hacktivity-bot](https://github.com/dwisiswant0/hacktivity-bot) 

[![wakatime](https://wakatime.com/badge/github/rickyzakariap/bot-push.svg)](https://wakatime.com/badge/github/rickyzakariap/bot-push)
