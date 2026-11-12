# Cahaya Idola — PWA Stok & Keuangan

Aplikasi web progresif (PWA) untuk mengelola katalog produk, persediaan, pemasukan, pengeluaran, dan ringkasan usaha. Dibuat dengan HTML, CSS, dan JavaScript murni sehingga dapat di-deploy sebagai static site di Vercel.

## Fitur
- Dashboard ringkasan produk, stok, pemasukan, pengeluaran, dan saldo.
- CRUD produk: nama, SKU, kategori, harga modal/jual, stok, dan batas stok minimum.
- Catatan transaksi pemasukan/pengeluaran, kategori, tanggal, dan pencarian/filter.
- Transaksi dapat dihubungkan ke produk untuk menambah/mengurangi stok otomatis.
- Laporan persediaan, nilai stok berdasarkan harga modal, dan ringkasan kas.
- Ekspor transaksi CSV serta backup/pemulihan JSON.
- PWA installable dan cache offline melalui Service Worker.
- Layout responsif untuk desktop dan ponsel.

## Menjalankan di VS Code
1. Ekstrak ZIP ini.
2. Buka folder `cahaya-idola-pwa` melalui VS Code.
3. Pasang ekstensi **Live Server** (opsional), lalu klik kanan `index.html` → **Open with Live Server**.
4. Alternatif: jalankan server statis dengan Python dari terminal:
   ```bash
   python -m http.server 8080
   ```
   Buka `http://localhost:8080`.
5. Untuk menguji PWA/offline, gunakan `localhost` atau HTTPS. Service Worker tidak berjalan dari `file://`.

## Upload ke GitHub
Buat repository kosong di GitHub, lalu dari terminal VS Code jalankan:
```bash
git init
git add .
git commit -m "Initial Cahaya Idola PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```
Ganti URL remote dengan URL repository milik Anda. Jika Git belum terpasang, instal Git terlebih dahulu.

## Deploy ke Vercel
1. Login ke [Vercel](https://vercel.com/) menggunakan akun GitHub.
2. Pilih **Add New → Project**, lalu import repository Cahaya Idola.
3. Framework Preset: **Other**.
4. Build Command: kosongkan / None.
5. Output Directory: `.` (root project).
6. Install Command: kosongkan.
7. Klik **Deploy**. Vercel akan memberi URL `*.vercel.app`.
8. Untuk domain sendiri: buka Project → **Settings → Domains**, masukkan domain yang dimiliki, lalu ikuti instruksi DNS Vercel.

Setiap `git push` ke branch yang terhubung akan memicu deployment baru.

## Cara penggunaan
1. Buka menu **Data Produk**, lalu tambahkan produk, harga modal, harga jual, stok awal, dan batas stok menipis.
2. Catat penjualan sebagai **Pemasukan** dan pilih produk + jumlah unit. Stok otomatis berkurang.
3. Catat pembelian stok sebagai **Pengeluaran** dan pilih produk + jumlah unit. Stok otomatis bertambah.
4. Pengeluaran operasional dan pemasukan lain dapat dicatat tanpa menghubungkan produk.
5. Buka **Laporan** untuk melihat ringkasan, mengunduh CSV, atau mencadangkan data JSON.

## Catatan penting tentang penyimpanan
Versi ini menyimpan data di `localStorage` browser/perangkat yang digunakan. Data tidak otomatis tersinkron antar HP/laptop atau antar pengguna, dan menghapus data browser dapat menghilangkannya. Gunakan **Cadangkan data** secara berkala. Untuk operasional multi-user, sinkronisasi antar perangkat, login, dan database terpusat, aplikasi perlu ditingkatkan dengan backend/database (misalnya Supabase atau Firebase).

Saldo dan laba/rugi kas di aplikasi adalah total pemasukan dikurangi pengeluaran yang dicatat, bukan laporan akuntansi lengkap. Nilai persediaan dihitung dari stok saat ini × harga modal produk. Transaksi terkait produk mengubah stok secara otomatis; saat mengedit atau menghapus transaksi, penyesuaian stok lama dibalik terlebih dahulu.

## Struktur folder
```text
cahaya-idola-pwa/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── service-worker.js
├── vercel.json
├── README.md
└── icons/
    ├── icon-192.svg
    └── icon-512.svg
```
