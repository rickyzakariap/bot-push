# Auto Push Discord Notifier (Mirip @bot-push)

Script ini secara otomatis:
- Mengambil data dari API gratis (JSONPlaceholder)
- Mengirim notifikasi ke Discord via webhook
- Menyimpan ID data yang sudah dikirim ke log.txt
- Melakukan auto-push log.txt ke GitHub jika ada update

## Cara Pakai

1. **Clone repo & install dependencies**
   ```bash
   git clone <repo-url>
   cd <folder>
   bun install
   # atau npm install jika pakai node-fetch (tidak wajib di Node.js v18+)
   ```

2. **Buat file `.env`**
   ```env
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id/your_webhook_token
   ```

3. **Jalankan script**
   ```bash
   node post.js
   # atau bun run post.js
   ```

4. **Cek Discord**
   - Notifikasi akan muncul di channel Discord yang sesuai dengan webhook.

5. **Cek GitHub**
   - Setiap ada update pada log.txt, script akan otomatis commit & push ke repo GitHub.

## Kustomisasi
- Untuk ganti sumber data, edit fungsi `fetchData()` di `post.js`.
- Untuk mengubah format pesan Discord, edit bagian payload di `post.js`.

## Catatan
- Pastikan sudah setup git remote dan credential agar auto-push berjalan lancar.
- File `log.txt` di-ignore oleh `.gitignore` (bisa diubah jika ingin file log muncul di repo).

---

Terinspirasi oleh [@bot-push (hacktivity-bot)](https://github.com/dwisiswant0/hacktivity-bot) 