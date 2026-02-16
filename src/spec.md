# Specification

## Summary
**Goal:** Membangun aplikasi web manajemen keuangan pribadi dengan autentikasi Internet Identity, penyimpanan data per pengguna, fitur transaksi/kategori, upload bukti transaksi, dashboard visual, kalender transaksi, analisis cashflow, serta UI premium fintech (Bahasa Indonesia, light/dark mode).

**Planned changes:**
- Tambahkan autentikasi Internet Identity (login/logout) dan proteksi halaman/data berbasis principal agar seluruh data terisolasi per pengguna.
- Buat model data & persistence di satu Motoko actor untuk kategori dan transaksi (termasuk referensi bukti/receipt), lengkap CRUD dan query listing (pagination, search, filter, sorting).
- Implement upload & retrieval gambar bukti transaksi (JPG/PNG ≤ 5MB) tersimpan di canister, termasuk thumbnail dan preview full-size via modal.
- Bangun UI Transaksi: form tambah/edit (jenis, kategori, nominal format currency, tanggal, catatan, receipt opsional) dan daftar/tabel dengan edit/delete, pagination, search, filter, sorting.
- Bangun Dashboard: KPI (saldo, pemasukan bulan ini, pengeluaran bulan ini, selisih cashflow), quick-add transaksi, 3 chart (bar income vs expense, pie distribusi kategori pengeluaran, line tren 6 bulan), dan peringatan saat pengeluaran > pemasukan bulan ini.
- Bangun Kalender Transaksi: tampilan monthly grid dengan total pemasukan/pengeluaran per hari, indikator dominan hijau/merah, ringkasan bulanan, dan klik hari untuk melihat daftar transaksi hari itu.
- Implement analisis & insight otomatis dari histori transaksi: rata-rata bulanan, perbandingan MoM, kategori pengeluaran terbesar bulan ini, forecast saldo akhir bulan, dan indikator kesehatan (Aman/Waspada/Boros) dengan badge/progress.
- Bangun UI Manajemen Kategori: list per tipe (pemasukan/pengeluaran), tambah/edit/hapus, pilih warna, field ikon opsional; kategori langsung tersedia di dropdown transaksi.
- Terapkan desain premium fintech konsisten: layout clean minimal, deep navy/dark blue + emerald + gradient aksen, rounded cards, soft shadow + glassmorphism ringan, responsif mobile-first, animasi halus, sidebar collapsible, dan toggle light/dark.
- Pastikan seluruh copy UI menggunakan Bahasa Indonesia (navigasi, label, tombol, empty state, validasi, notifikasi).

**User-visible outcome:** Pengguna dapat login dengan Internet Identity, mengelola kategori dan transaksi (dengan bukti foto opsional), melihat ringkasan dan grafik di dashboard, meninjau transaksi lewat kalender, serta mendapatkan insight cashflow otomatis—semuanya dalam UI premium fintech berbahasa Indonesia dengan mode terang/gelap.
