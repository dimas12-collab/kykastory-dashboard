# Kykastory WeddingPress Bridge

Bridge ini dibuat untuk `wdp-pro-v4.0.6` yang menyimpan Guestbook pada tabel `wp_wdp_guestbooks` dan menerima submit melalui AJAX `guestbook_box_submit`.

## Instalasi

1. Buat folder `kykastory-weddingpress-bridge` di `wp-content/plugins/`.
2. Upload file `kykastory-weddingpress-bridge.php` ke folder tersebut.
3. Aktifkan plugin dari **Plugins → Installed Plugins**.
4. Buka **Settings → Kykastory Bridge**.
5. Isi pengaturan:

```text
Aktifkan bridge: dicentang
Endpoint: https://id.kykastory.com/api/projects/PROJECT_ID/rsvp/sync
Project ID: demo-project
Webhook secret: sama dengan WEDDINGPRESS_WEBHOOK_SECRET di Coolify
Form ID: budiriri
```

6. Simpan pengaturan.
7. Kirim satu RSVP percobaan dari halaman undangan WordPress.
8. Cek **Dashboard Kykastory → RSVP & Ucapan**.

Bridge berjalan sebelum handler WeddingPress pada priority 4, karena handler plugin WeddingPress berjalan pada priority 5 dan mengakhiri request dengan `wp_die()`.

## Catatan

- Plugin tidak mengubah data Guestbook WeddingPress.
- Jika endpoint tidak aktif atau error, RSVP WeddingPress tetap diproses normal.
- Form ID `budiriri` bisa diganti jika form yang digunakan berbeda.
- Jangan commit webhook secret ke GitHub. Simpan secret hanya di WordPress Settings dan Coolify Environment Variables.
