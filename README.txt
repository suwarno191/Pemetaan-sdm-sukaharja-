PEMETAAN SDM DESA SUKAHARJA - VERSI GITHUB FINAL

HASIL:
- Warga membuka halaman publik dengan ?warga=1.
- Warga mengisi data sendiri.
- Data masuk ke Google Sheets pusat.
- Dashboard admin membaca database yang sama.
- Pencari kerja otomatis berasal dari status "Belum Bekerja".
- Wilayah diperbaiki menjadi 7 dusun, 14 RW, 47 RT.

FILE:
1. index.html = Pemetaan_SDM_Desa_Sukaharja_FINAL_SIAP_PAKAI.html
2. Code_Github_Final.gs = backend Google Apps Script

SETUP BACKEND:
1. Buat Google Sheet baru.
2. Extensions > Apps Script.
3. Hapus kode lama.
4. Tempel isi Code_Github_Final.gs.
5. Save.
6. Jalankan setupDatabase() satu kali dan izinkan akses.
7. Deploy > New deployment > Web app.
8. Execute as: Me.
9. Who has access: Anyone.
10. Salin URL yang berakhiran /exec.

SETUP GITHUB:
1. Rename file HTML menjadi index.html.
2. Upload index.html ke repository GitHub.
3. Aktifkan GitHub Pages.
4. Dari halaman admin, gunakan BAGIKAN VIA WHATSAPP.
5. Masukkan URL /exec tadi satu kali.
6. Link WhatsApp yang dibagikan otomatis membawa koneksi database.

CATATAN DUSUN:
Data resmi Kecamatan Telukjambe Timur menyebut Desa Sukaharja memiliki 7 dusun, 14 RW dan 47 RT. Nama dusun yang dipakai di form mengikuti sumber desa yang ditemukan: Dusun 1 Ulekan, Dusun 2 Jatimulya, Dusun 3 Jatimulya, Dusun 4 Jatimulya, Dusun 5 Pakuncen, Dusun 6 Pakuncen, Dusun 7 Bumi Telukjambe.
