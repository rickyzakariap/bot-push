# RSS to Discord Auto Poster

This project automatically fetches news from multiple RSS feeds and posts them to a Discord channel using a webhook. It features intelligent scheduling with random posting patterns via GitHub Actions.

## Features

- **Smart Random Posting:** Different posting patterns for weekdays vs weekends
- **Friday Special Bot:** Dedicated Friday afternoon posting (4-6 PM)
- **Daily Limits:** Maximum 10 articles per day with automatic reset
- **Log Management:** Automatic log rotation and numbering system
- **Git Integration:** Automatic commits and pushes after each run

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

### Main Bot (`rss-to-discord.yml`)
- **Schedule:** Daily at 8:00 UTC
- **Weekdays (Mon-Fri):** Random 1-4 posts per day
- **Weekends (Sat-Sun):** Random 5-8 posts per day
- **Daily Limit:** Maximum 10 articles per day (resets daily)

### Friday Special Bot (`friday-rss-bot.yml`)
- **Schedule:** Fridays at 4, 5, and 6 PM UTC
- **Posts:** Random 1-10 posts per hour during the time window
- **Total Friday Posts:** Up to 30 posts maximum (3 hours × 10 posts)

### Log Management
- **Log Rotation:** When `log.txt` reaches 50 lines, it's cleared and numbering restarts from 1
- **Commit Author:** Commits are made using your GitHub username and email (requires a Personal Access Token)

### Setup Personal Access Token (PAT)
1. Create a PAT with `repo` scope at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens).
2. Add the token to your repository secrets as `GH_PAT`.

### Required Repository Secrets
- `DISCORD_WEBHOOK_URL` — Your Discord webhook URL
- `GH_PAT` — GitHub Personal Access Token with repo permissions
- `RSS_URL` — (Optional) RSS URL if your script uses this secret

## Files

### Core Files
- `rss-to-discord.js` — Main RSS fetching and Discord posting script
- `rss-feeds.txt` — List of RSS feed URLs (one per line)
- `package.json` — Node.js dependencies

### Log Files
- `log.txt` — Log of sent articles with timestamps
- `log_number.txt` — Last article number for continuous numbering
- `daily_count.txt` — Daily sent counter (resets at midnight)

### Workflow Files
- `.github/workflows/rss-to-discord.yml` — Main daily bot workflow
- `.github/workflows/friday-rss-bot.yml` — Friday special bot workflow

## How It Works

1. **Daily Bot:** Runs every day at 8:00 UTC, determines the day of week, and posts randomly based on the schedule
2. **Friday Bot:** Runs every Friday at 4, 5, and 6 PM UTC, posting up to 10 times per hour
3. **Article Selection:** Fetches from multiple RSS feeds and posts the latest articles
4. **Rate Limiting:** Includes delays between posts to avoid Discord rate limits
5. **Git Integration:** Automatically commits and pushes log updates after each run

## Example Output

```
Posting 3 times today
Run #1
[001] OK
Run #2
[002] OK
Run #3
[003] OK
```

---

Inspired by [@hacktivity-bot](https://github.com/dwisiswant0/hacktivity-bot) 

[![wakatime](https://wakatime.com/badge/github/rickyzakariap/bot-push.svg)](https://wakatime.com/badge/github/rickyzakariap/bot-push)
